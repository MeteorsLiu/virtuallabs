import { BookOpen, Plus, Trash2, Upload, Video } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';

interface Chapter {
  title: string;
  duration: string;
  description: string;
  content: string;
  videoFile?: File;
}

function CreateCourse() {
  const navigate = useNavigate();
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<string>('beginner');
  const [chapters, setChapters] = useState<Chapter[]>([
    { title: '', duration: '', description: '', content: '' }
  ]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newChapters = [...chapters];
      newChapters[index] = {
        ...newChapters[index],
        videoFile: file
      };
      setChapters(newChapters);
    }
  };

  const removeVideo = (index: number) => {
    const newChapters = [...chapters];
    newChapters[index] = {
      ...newChapters[index],
      videoFile: undefined
    };
    setChapters(newChapters);
  };

  const addChapter = () => {
    setChapters([...chapters, { title: '', duration: '', description: '', content: '' }]);
  };

  const removeChapter = (index: number) => {
    setChapters(chapters.filter((_, i) => i !== index));
  };

  const updateChapter = (index: number, field: keyof Chapter, value: string) => {
    const newChapters = [...chapters];
    newChapters[index] = { ...newChapters[index], [field]: value };
    setChapters(newChapters);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Create course
      const course = await apiClient.createCourse({
        courseName: courseTitle,
        description: courseDescription,
        difficultyLevel: difficulty,
      });

      // 2. Upload cover image if exists
      if (coverImage) {
        const uploadResult = await apiClient.uploadFile(coverImage, {
          uploadType: 'courseCover',
          targetId: course.courseId
        });

        // Update course with cover image URL
        await apiClient.updateCourse(course.courseId, {
            coverUrl: uploadResult.url
        });
      }

      // 3. Create chapters and upload videos
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];

        // Upload video if exists
        let videoUrl: string | undefined;
        if (chapter.videoFile) {
          const uploadResult = await apiClient.uploadFile(chapter.videoFile, {
            uploadType: 'chapterVideo',
            targetId: course.courseId
          });
          videoUrl = uploadResult.url;
        }

        // Create chapter
        await apiClient.createChapter(course.courseId, {
          chapterTitle: chapter.title,
          chapterDescription: chapter.description,
          videoUrl,
          sortOrder: i + 1
        });
      }

      navigate(`/courses/${course.courseId}`);
    } catch (err) {
      console.error('Error creating course:', err);
      setError('创建课程失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <BookOpen className="h-6 w-6 mr-2" />
          创建新课程
        </h2>
        <button
          onClick={() => navigate('/courses')}
          className="text-gray-600 hover:text-gray-900"
        >
          取消
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                课程标题
              </label>
              <input
                type="text"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="输入课程标题"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                课程描述
              </label>
              <textarea
                value={courseDescription}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="详细描述课程内容和学习目标"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                难度级别
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="beginner">入门级</option>
                <option value="intermediate">中级</option>
                <option value="advanced">高级</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              课程封面
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              {imagePreview ? (
                <div className="relative w-full">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImage(null);
                      setImagePreview('');
                    }}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                  >
                    <Trash2 className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                      <span>上传图片</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF 最大 10MB</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">课程章节</h3>
            <button
              type="button"
              onClick={addChapter}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              添加章节
            </button>
          </div>

          <div className="space-y-4">
            {chapters.map((chapter, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 bg-gray-50 relative"
              >
                {chapters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeChapter(index)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      章节标题
                    </label>
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) => updateChapter(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder={`第 ${index + 1} 章`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      时长
                    </label>
                    <input
                      type="text"
                      value={chapter.duration}
                      onChange={(e) => updateChapter(index, 'duration', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="如：45分钟"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    章节描述
                  </label>
                  <textarea
                    value={chapter.description}
                    onChange={(e) => updateChapter(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="简要描述本章节的内容"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    章节内容
                  </label>
                  <textarea
                    value={chapter.content}
                    onChange={(e) => updateChapter(index, 'content', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                    placeholder="使用Markdown格式编写章节内容"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    章节视频
                  </label>
                  {chapter.videoFile ? (
                    <div className="relative rounded-lg overflow-hidden">
                      <video
                        src={URL.createObjectURL(chapter.videoFile)}
                        className="w-full h-48 object-cover"
                        controls
                      />
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                      >
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-gray-300 border-dashed rounded-lg p-4">
                      <div className="flex flex-col items-center">
                        <Video className="h-8 w-8 text-gray-400 mb-2" />
                        <label className="cursor-pointer">
                          <span className="text-sm text-indigo-600 hover:text-indigo-500">上传视频</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="video/*"
                            onChange={(e) => handleVideoChange(index, e)}
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">支持 MP4, WebM 格式</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate('/courses')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            取消
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? '创建中...' : '创建课程'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateCourse;
