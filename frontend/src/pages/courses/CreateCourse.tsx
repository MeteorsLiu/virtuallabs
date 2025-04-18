import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Trash2, Clock, Award, Upload, Video } from 'lucide-react';

interface Chapter {
  title: string;
  duration: string;
  description: string;
  videoUrl: string;
  videoFile?: File;
}

function CreateCourse() {
  const navigate = useNavigate();
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [chapters, setChapters] = useState<Chapter[]>([
    { title: '', duration: '', description: '', videoUrl: '' }
  ]);
  const [imagePreview, setImagePreview] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
        videoFile: file,
        videoUrl: URL.createObjectURL(file)
      };
      setChapters(newChapters);
    }
  };

  const removeVideo = (index: number) => {
    const newChapters = [...chapters];
    if (newChapters[index].videoUrl) {
      URL.revokeObjectURL(newChapters[index].videoUrl);
    }
    newChapters[index] = {
      ...newChapters[index],
      videoUrl: '',
      videoFile: undefined
    };
    setChapters(newChapters);
  };

  const addChapter = () => {
    setChapters([...chapters, { title: '', duration: '', description: '', videoUrl: '' }]);
  };

  const removeChapter = (index: number) => {
    const chapter = chapters[index];
    if (chapter.videoUrl) {
      URL.revokeObjectURL(chapter.videoUrl);
    }
    setChapters(chapters.filter((_, i) => i !== index));
  };

  const updateChapter = (index: number, field: keyof Chapter, value: string) => {
    const newChapters = [...chapters];
    newChapters[index] = { ...newChapters[index], [field]: value };
    setChapters(newChapters);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log({
      courseTitle,
      courseDescription,
      difficulty,
      chapters: chapters.map(chapter => ({
        ...chapter,
        videoFile: chapter.videoFile?.name
      }))
    });
    navigate('/courses');
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
                    onClick={() => setImagePreview('')}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    章节视频
                  </label>
                  {chapter.videoUrl ? (
                    <div className="relative rounded-lg overflow-hidden">
                      <video
                        src={chapter.videoUrl}
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
          >
            取消
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            创建课程
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateCourse;