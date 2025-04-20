import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import type { Assessment, Question } from '../../types';

interface StudentAssessmentViewProps {
  courseId: number;
  chapterId: number;
}

function StudentAssessmentView({ courseId, chapterId }: StudentAssessmentViewProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    fetchAssessments();
  }, [courseId, chapterId]);

  useEffect(() => {
    if (selectedAssessment) {
      fetchQuestions(selectedAssessment.assessmentId);
      if (selectedAssessment.timeLimit) {
        setTimeLeft(selectedAssessment.timeLimit * 60); // Convert minutes to seconds
      }
    }
  }, [selectedAssessment]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (timeLeft !== null && timeLeft > 0 && !submitted) {
      timer = setInterval(() => {
        setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft, submitted]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAssessments(courseId);
      setAssessments(response);
      if (response.length > 0) {
        setSelectedAssessment(response[0]);
      }
    } catch (err) {
      setError('获取试题集失败');
      console.error('Error fetching assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (assessmentId: number) => {
    try {
      const response = await apiClient.getQuestions(assessmentId);
      setQuestions(response);
      // Initialize answers object
      const initialAnswers: Record<number, number[]> = {};
      response.forEach(q => {
        initialAnswers[q.questionId] = [];
      });
      setAnswers(initialAnswers);
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  const handleAnswerSelect = (questionId: number, optionId: number) => {
    setAnswers(prev => {
      const question = questions.find(q => q.questionId === questionId);
      if (!question) return prev;

      if (question.type === 'single') {
        // For single choice, replace the answer
        return { ...prev, [questionId]: [optionId] };
      } else {
        // For multiple choice, toggle the answer
        const currentAnswers = prev[questionId] || [];
        return {
          ...prev,
          [questionId]: currentAnswers.includes(optionId)
            ? currentAnswers.filter(id => id !== optionId)
            : [...currentAnswers, optionId]
        };
      }
    });
  };

  const handleSubmit = async () => {
    if (!selectedAssessment) return;

    try {
      // Submit answers for each question
      await Promise.all(
        Object.entries(answers).map(([questionId, selectedOptions]) =>
          apiClient.submitAnswer(selectedAssessment.assessmentId, {
            questionId: Number(questionId),
            optionIds: selectedOptions
          })
        )
      );
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting answers:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={fetchAssessments}
          className="mt-4 text-indigo-600 hover:text-indigo-800"
        >
          重试
        </button>
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="text-center text-gray-500">
        暂无练习题
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">课后练习</h3>
        {timeLeft !== null && (
          <div className="flex items-center text-gray-600">
            <Clock className="h-5 w-5 mr-2" />
            剩余时间：{formatTime(timeLeft)}
          </div>
        )}
      </div>

      {assessments.length > 1 && (
        <div className="flex space-x-4">
          {assessments.map(assessment => (
            <button
              key={assessment.assessmentId}
              onClick={() => setSelectedAssessment(assessment)}
              className={`px-4 py-2 rounded-lg ${
                selectedAssessment?.assessmentId === assessment.assessmentId
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {assessment.title}
            </button>
          ))}
        </div>
      )}

      {selectedAssessment && (
        <div className="space-y-6">
          {questions.map((question, qIndex) => (
            <div key={question.questionId} className="bg-gray-50 rounded-lg p-6">
              <p className="font-medium mb-4">
                {qIndex + 1}. {question.content}
                <span className="ml-2 text-sm text-gray-500">
                  ({question.type === 'single' ? '单选题' : '多选题'})
                </span>
              </p>
              <div className="space-y-2">
                {question.options.map((option) => (
                  <label
                    key={option.optionId}
                    className={`flex items-center p-3 rounded-lg cursor-pointer ${
                      answers[question.questionId]?.includes(option.optionId)
                        ? 'bg-indigo-50 border border-indigo-200'
                        : 'bg-white border border-gray-200'
                    } ${
                      submitted
                        ? option.isCorrect
                          ? 'border-green-500'
                          : answers[question.questionId]?.includes(option.optionId)
                          ? 'border-red-500'
                          : 'border-gray-200'
                        : 'hover:border-gray-300'
                    }`}
                  >
                    <input
                      type={question.type === 'single' ? 'radio' : 'checkbox'}
                      checked={answers[question.questionId]?.includes(option.optionId)}
                      onChange={() => handleAnswerSelect(question.questionId, option.optionId)}
                      disabled={submitted}
                      className="mr-3"
                    />
                    <span>{option.content}</span>
                    {submitted && (
                      option.isCorrect ? (
                        <CheckCircle className="ml-auto h-5 w-5 text-green-500" />
                      ) : answers[question.questionId]?.includes(option.optionId) ? (
                        <XCircle className="ml-auto h-5 w-5 text-red-500" />
                      ) : null
                    )}
                  </label>
                ))}
              </div>
              {submitted && question.explanation && (
                <div className="mt-4 text-sm text-gray-600 bg-gray-100 p-4 rounded-lg">
                  <p className="font-medium">解析：</p>
                  <p>{question.explanation}</p>
                </div>
              )}
            </div>
          ))}

          {!submitted && (
            <button
              onClick={handleSubmit}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              提交答案
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default StudentAssessmentView;
