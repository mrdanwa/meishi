import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import api from "../../../../config/api";
import { handleError } from "../../../../utils/errorHandler";

export default function DishForm({
  isOpen,
  onClose,
  restaurantId,
  dish,
  onSuccess,
}) {
  const initialFormState = {
    name: "",
    description: "",
    price: "",
    type: "",
    course_id: "",
    category_ids: [],
  };

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [image, setImage] = useState(null);
  const [shouldDeleteImage, setShouldDeleteImage] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMetadata();
      if (dish) {
        setFormData({
          name: dish.name || "",
          description: dish.description || "",
          price: dish.price || "",
          type: dish.type || "",
          course_id: dish.course?.id || "",
          category_ids: dish.categories?.map((cat) => cat.id) || [],
        });
      }
    } else {
      setFormData(initialFormState);
      setImage(null);
      setShouldDeleteImage(false);
      setShowCategories(false);
    }
  }, [isOpen, dish]);

  const fetchMetadata = async () => {
    try {
      const [coursesRes, categoriesRes] = await Promise.all([
        api.get("/api/courses/"),
        api.get("/api/categories/"),
      ]);
      setCourses(coursesRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      handleError(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setShouldDeleteImage(false);
    }
  };

  const handleDeleteImage = () => {
    setImage(null);
    setShouldDeleteImage(true);
  };

  const getSelectedCategoriesText = () => {
    const selected = categories.filter((cat) =>
      formData.category_ids.includes(cat.id)
    );
    if (selected.length === 0) return "Select Categories";
    if (selected.length <= 2) return selected.map((cat) => cat.name).join(", ");
    return `${selected.length} categories selected`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formPayload = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "category_ids") {
        formData[key].forEach((id) => formPayload.append("category_ids", id));
      } else if (formData[key] !== null && formData[key] !== "") {
        formPayload.append(key, formData[key]);
      }
    });

    if (shouldDeleteImage) {
      formPayload.append("image", "");
    } else if (image) {
      formPayload.append("image", image);
    }

    try {
      if (dish) {
        await api.patch(`/api/dishes/${dish.id}/update/`, formPayload);
      } else {
        await api.post(
          `/api/restaurants/${restaurantId}/dishes/create/`,
          formPayload
        );
      }
      onSuccess();
      onClose();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {dish ? "Edit Dish" : "Add New Dish"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-8">
              {/* Image Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Image
                </label>
                <div className="flex items-start space-x-4">
                  {(image || dish?.image) && (
                    <div className="relative">
                      <img
                        src={image ? URL.createObjectURL(image) : dish.image}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-lg border border-gray-200"
                      />
                      {(dish?.image || image) && !shouldDeleteImage && (
                        <button
                          type="button"
                          onClick={handleDeleteImage}
                          className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 hover:bg-red-200"
                        >
                          <svg
                            className="w-4 h-4 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 
                               file:px-4 file:rounded-md file:border-0 file:text-sm 
                               file:font-semibold file:bg-indigo-50 file:text-indigo-700
                               hover:file:bg-indigo-100"
                    />
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    maxLength={30}
                    className="mt-1 block w-full rounded-md border border-gray-300 
                             px-3 py-2 text-gray-900 placeholder-gray-500 
                             focus:border-indigo-500 focus:outline-none focus:ring-1 
                             focus:ring-indigo-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    maxLength={200}
                    rows="3"
                    className="mt-1 block w-full rounded-md border border-gray-300 
                             px-3 py-2 text-gray-900 placeholder-gray-500 
                             focus:border-indigo-500 focus:outline-none focus:ring-1 
                             focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    className="mt-1 block w-full rounded-md border border-gray-300 
                             px-3 py-2 text-gray-900 placeholder-gray-500 
                             focus:border-indigo-500 focus:outline-none focus:ring-1 
                             focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Type
                  </label>
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    maxLength={20}
                    className="mt-1 block w-full rounded-md border border-gray-300 
                             px-3 py-2 text-gray-900 placeholder-gray-500 
                             focus:border-indigo-500 focus:outline-none focus:ring-1 
                             focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Course
                  </label>
                  <select
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 
                             px-3 py-2 text-gray-900 bg-white 
                             focus:border-indigo-500 focus:outline-none focus:ring-1 
                             focus:ring-indigo-500"
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-900">
                    Categories
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCategories(!showCategories)}
                    className="mt-1 w-full px-3 py-2 text-left text-sm bg-white 
                             border border-gray-300 rounded-md focus:outline-none 
                             focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {getSelectedCategoriesText()}
                  </button>

                  {showCategories && (
                    <div
                      className="absolute z-[10000] w-full mt-1 bg-white border border-gray-300 
                                  rounded-md shadow-lg max-h-48 overflow-auto"
                    >
                      {categories.map((category) => (
                        <label
                          key={category.id}
                          className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.category_ids.includes(
                              category.id
                            )}
                            onChange={() => {
                              const newIds = formData.category_ids.includes(
                                category.id
                              )
                                ? formData.category_ids.filter(
                                    (id) => id !== category.id
                                  )
                                : [...formData.category_ids, category.id];
                              setFormData((prev) => ({
                                ...prev,
                                category_ids: newIds,
                              }));
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 
                                     focus:ring-indigo-500"
                          />
                          <span className="ml-3 text-sm text-gray-700">
                            {category.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 
           rounded-xl hover:bg-blue-700 disabled:opacity-50 
           focus:outline-none focus:ring-2 focus:ring-blue-500 
           focus:ring-offset-2 transition-all duration-300 shadow-sm"
              >
                {loading ? "Saving..." : dish ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
