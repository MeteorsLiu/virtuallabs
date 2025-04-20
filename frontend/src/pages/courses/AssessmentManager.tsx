import { CheckCircle, Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import type { Assessment, CreateAssessmentRequest, CreateQuestionRequest, Question } from '../../types';

interface AssessmentManagerProps {
  courseId: number;
  chapterId?: number;
}

function AssessmentManager({ courseId, chapterId }: AssessmentManagerProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newAssessment, setNewAssessment] = useState<CreateAssessmentRequest>({
    assessmentName: '',
    assessmentType: 'quiz',
    maxScore: 100,
    weight: 1,
    assessmentDate:  Math.floor(Date.now() / 1000).toFixed()
  });

  const [newQuestion, setNewQuestion] = useState<CreateQuestionRequest>({
    assessmentId: 0,
    courseId: courseId,
    content: '',
    questionType: 'single',
    options: [
      { content: '', isCorrect: false, sortOrder: 0 },
      { content: '', isCorrect: false, sortOrder: 1 }
    ],
    sortOrder: 0
  });

  useEffect(() => {
    fetchAssessments();
  }, [courseId, chapterId]);

  useEffect(() => {
    if (selectedAssessment) {
      fetchQuestions(selectedAssessment.assessmentId);
    }
  }, [selectedAssessment]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAssessments(courseId);
      setAssessments(response);
      if (response.length > 0 && !selectedAssessment) {
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
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  const handleCreateAssessment = async () => {
    try {
      const response = await apiClient.createAssessment(courseId, newAssessment);
      setAssessments([...assessments, response]);
      setSelectedAssessment(response);
      setShowAssessmentForm(false);
      setNewAssessment({
        assessmentName: '',
        assessmentType: 'quiz',
        maxScore: 100,
        weight: 1,
        assessmentDate:  Math.floor(Date.now() / 1000).toFixed()
      });
    } catch (err) {
      console.error('Error creating assessment:', err);
    }
  };

  const handleCreateQuestion = async () => {
    if (!selectedAssessment) return;

    try {
      const response = await apiClient.createQuestion(selectedAssessment.assessmentId, {
        ...newQuestion,
        courseId: courseId,
        assessmentId: selectedAssessment.assessmentId
      });
      setQuestions([...questions, response]);
      setShowQuestionForm(false);
      setNewQuestion({
        assessmentId: selectedAssessment.assessmentId,
        content: '',
        questionType: 'single',
        courseId: courseId,
        options: [
          { content: '', isCorrect: false, sortOrder: 0 },
          { content: '', isCorrect: false, sortOrder: 1 }
        ],
        sortOrder: questions.length
      });
    } catch (err) {
      console.error('Error creating question:', err);
    }
  };

  const handleAddOption = () => {
    setNewQuestion(prev => ({
      ...prev,
      options: [
        ...prev.options,
        {
          content: '',
          isCorrect: false,
          sortOrder: prev.options.length
        }
      ]
    }));
  };

  const handleRemoveOption = (index: number) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleOptionChange = (index: number, field: keyof typeof newQuestion.options[0], value: string | boolean) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.map((option, i) =>
        i === index ? { ...option, [field]: value } : option
      )
    }));
  };

  if (loading && assessments.length === 0) {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">试题管理</h3>
        <button
          onClick={() => setShowAssessmentForm(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          创建试题集
        </button>
      </div>

      {showAssessmentForm && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium mb-4">新建试题集</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                试题集名称
              </label>
              <input
                type="text"
                value={newAssessment.assessmentName}
                onChange={(e) => setNewAssessment(prev => ({ ...prev, assessmentName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="请输入试题集名称"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                试题类型
              </label>
              <select
                value={newAssessment.assessmentType}
                onChange={(e) => setNewAssessment(prev => ({ ...prev, assessmentType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="quiz">测验</option>
                <option value="exam">考试</option>
                <option value="homework">作业</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                满分分值
              </label>
              <input
                type="number"
                value={newAssessment.maxScore}
                onChange={(e) => setNewAssessment(prev => ({ ...prev, maxScore: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                权重
              </label>
              <input
                type="number"
                value={newAssessment.weight}
                onChange={(e) => setNewAssessment(prev => ({ ...prev, weight: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                考试日期
              </label>
              <input
                type="date"
                value={new Date(+newAssessment.assessmentDate * 1000).toISOString().split('T')[0]}
                onChange={(e) => setNewAssessment(prev => ({ ...prev, assessmentDate: Math.floor(new Date(e.target.value).getTime() / 1000).toFixed()         }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAssessmentForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleCreateAssessment}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {assessments.length > 0 && (
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-1 space-y-2">
            {assessments.map(assessment => (
              <button
                key={assessment.assessmentId}
                onClick={() => setSelectedAssessment(assessment)}
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  selectedAssessment?.assessmentId === assessment.assessmentId
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                {assessment.title}
              </button>
            ))}
          </div>

          <div className="col-span-3">
            {selectedAssessment && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{selectedAssessment.title}</h4>
                  <button
                    onClick={() => setShowQuestionForm(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    添加题目
                  </button>
                </div>

                {showQuestionForm && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium mb-4">新建题目</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          题目类型
                        </label>
                        <select
                          value={newQuestion.questionType}
                          onChange={(e) => setNewQuestion(prev => ({ ...prev, type: e.target.value as 'single' | 'multiple' }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="single">单选题</option>
                          <option value="multiple">多选题</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          题目内容
                        </label>
                        <textarea
                          value={newQuestion.content}
                          onChange={(e) => setNewQuestion(prev => ({ ...prev, content: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="请输入题目内容"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          选项
                        </label>
                        <div className="space-y-2">
                          {newQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type={newQuestion.questionType === 'single' ? 'radio' : 'checkbox'}
                                checked={option.isCorrect}
                                onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                                name="correct-option"
                                className="h-4 w-4 text-indigo-600"
                              />
                              <input
                                type="text"
                                value={option.content}
                                onChange={(e) => handleOptionChange(index, 'content', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                                placeholder={`选项 ${index + 1}`}
                              />
                              {index > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(index)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={handleAddOption}
                          className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          + 添加选项
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          解析（可选）
                        </label>
                        <textarea
                          value={newQuestion.explanation || ''}
                          onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="请输入题目解析"
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowQuestionForm(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          onClick={handleCreateQuestion}
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          保存题目
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={question.questionId} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-sm text-gray-500">#{index + 1}</span>
                          <p className="font-medium mt-1">{question.content}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-gray-400 hover:text-indigo-600">
                            <Edit className="h-5 w-5" />
                          </button>
                          <button className="text-gray-400 hover:text-red-600">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        {question.options.map((option, oIndex) => (
                          <div
                            key={option.optionId}
                            className={`flex items-center p-3 rounded-lg ${
                              option.isCorrect ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                            } border`}
                          >
                            <span className="mr-3">{String.fromCharCode(65 + oIndex)}.</span>
                            <span>{option.content}</span>
                            {option.isCorrect && (
                              <CheckCircle className="ml-auto h-5 w-5 text-green-500" />
                            )}
                          </div>
                        ))}
                      </div>
                      {question.explanation && (
                        <div className="mt-4 text-sm text-gray-600">
                          <p className="font-medium">解析：</p>
                          <p>{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AssessmentManager;
