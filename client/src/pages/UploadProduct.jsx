import React, { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import uploadImage from "../utils/UploadImage";
import Loading from "../components/Loading";
import ViewImage from "../components/ViewImage";
import { MdDelete } from "react-icons/md";
import { useSelector } from "react-redux";
import { IoClose } from "react-icons/io5";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import successAlert from "../utils/SuccessAlert";

const UploadProduct = () => {
  const [data, setData] = useState({
    name: "",
    image: [],
    category: [],
    subCategory: [],
    unit: "",
    stock: "",
    price: "",
    discount: "",
    description: "",
    variations: [],
  });

  const [imageLoading, setImageLoading] = useState(false);
  const [ViewImageURL, setViewImageURL] = useState("");

  const allCategory = useSelector((state) => state.product.allCategory);

  const [selectCategory, setSelectCategory] = useState("");
  const [selectSubCategory, setSelectSubCategory] = useState("");

  // const [variations,setVariants] = useState

  const allSubCategory = useSelector((state) => state.product.allSubCategory);

  const [fieldName, setFieldName] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData((preve) => {
      return {
        ...preve,
        [name]: value,
      };
    });

    console.log("data", data);
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }
    setImageLoading(true);
    const response = await uploadImage(file);
    const { data: ImageResponse } = response;
    const imageUrl = ImageResponse.data.url;

    setData((preve) => {
      return {
        ...preve,
        image: [...preve.image, imageUrl],
      };
    });
    setImageLoading(false);
  };

  // handle variation change

  const handleVariationChange = (index, key, value) => {
    const newVariations = [...data.variations];

    newVariations[index][key] = value;

    setData((prev) => ({
      ...prev,
      variations: newVariations,
    }));
  };

  // Add a new variation

  const addVariation = () => {
    setData((prev) => ({
      ...prev,
      variations: [...prev.variations, { option: "", price: "" }],
    }));
  };

  // Remove a variation

  const removeVariation = (index) => {
    setData((prev) => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index),
    }));
  };

  const handleDeleteImage = async (index) => {
    data.image.splice(index, 1);
    setData((preve) => {
      return {
        ...preve,
      };
    });
  };

  const handleRemoveCategory = async (index) => {
    data.category.splice(index, 1);
    setData((preve) => {
      return {
        ...preve,
      };
    });
  };

  const handleRemoveSubCategory = async (index) => {
    data.subCategory.splice(index, 1);
    setData((preve) => {
      return {
        ...preve,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("data", data);

    try {
      const response = await Axios({
        ...SummaryApi.createProduct,
        data: data,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        successAlert(responseData.message);
        setData({
          name: "",
          image: [],
          category: [],
          subCategory: [],
          unit: "",
          stock: "",
          price: "",
          discount: "",
          description: "",
          variations: [],
        });
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <section className="">
      <div className="p-2   bg-white shadow-md flex items-center justify-between">
        <h2 className="font-semibold">Upload Product</h2>
      </div>
      <div className="grid p-3">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label htmlFor="name" className="font-medium">
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter product name"
              name="name"
              value={data.name}
              onChange={handleChange}
              required
              className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="description" className="font-medium">
              Description
            </label>
            <textarea
              id="description"
              type="text"
              placeholder="Enter product description"
              name="description"
              value={data.description}
              onChange={handleChange}
              required
              multiple
              rows={3}
              className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded resize-none"
            />
          </div>

          <div>
            <p className="font-medium">Image</p>
            <div>
              <label
                htmlFor="productImage"
                className="bg-blue-50 h-24 border rounded flex justify-center items-center cursor-pointer"
              >
                <div className="text-center flex justify-center items-center flex-col">
                  {imageLoading ? (
                    <Loading />
                  ) : (
                    <>
                      <FaCloudUploadAlt size={35} />
                      <p>Upload Image</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  id="productImage"
                  className="hidden"
                  accept="image/*"
                  onChange={handleUploadImage}
                />
              </label>

              {/**display uploded image*/}

              <div className="flex flex-wrap gap-4">
                {data.image.map((img, index) => {
                  return (
                    <div
                      key={img + index}
                      className="h-20 mt-1 w-20 min-w-20 bg-blue-50 border relative group"
                    >
                      <img
                        src={img}
                        alt={img}
                        className="w-full h-full object-scale-down cursor-pointer"
                        onClick={() => setViewImageURL(img)}
                      />
                      <div
                        onClick={() => handleDeleteImage(index)}
                        className="absolute bottom-0 right-0 p-1 bg-red-600 hover:bg-red-600 rounded text-white hidden group-hover:block cursor-pointer"
                      >
                        <MdDelete />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-1">
            <label className="font-medium">Category</label>
            <div>
              <select
                className="bg-blue-50 border w-full p-2 rounded"
                value={selectCategory}
                onChange={(e) => {
                  const value = e.target.value;
                  const category = allCategory.find((el) => el._id == value);
                  console.log(allCategory, e.target.value, category);

                  setData((preve) => {
                    return {
                      ...preve,
                      category: [...preve.category, category],
                    };
                  });

                  setSelectCategory("");
                }}
              >
                <option value={""}>Select Category</option>
                {allCategory.map((c, index) => {
                  return <option value={c?._id}>{c.name}</option>;
                })}
              </select>
              <div className="flex flex-wrap gap-3">
                {data.category.map((c, index) => {
                  return (
                    <div
                      key={c?._id + index + "productsection"}
                      className="text-sm flex items-center gap-1 bg-blue-50 mt-2"
                    >
                      <p>{c?.name}</p>
                      <div
                        className="hover:text-red-500 cursor-pointer"
                        onClick={() => handleRemoveCategory(index)}
                      >
                        <IoClose size={20} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-1">
            <label className="font-medium">Sub Category</label>
            <div>
              <select
                className="bg-blue-50 border w-full p-2 rounded"
                value={selectSubCategory}
                onChange={(e) => {
                  const value = e.target.value;
                  const subCategory = allSubCategory.find(
                    (el) => el._id == value
                  );

                  setData((preve) => {
                    return {
                      ...preve,
                      subCategory: [...preve.subCategory, subCategory],
                    };
                  });
                  setSelectSubCategory("");
                }}
              >
                <option value={""} className="text-neutral-600">
                  Select Sub Category
                </option>
                {allSubCategory.map((c, index) => {
                  return <option value={c?._id}>{c.name}</option>;
                })}
              </select>
              <div className="flex flex-wrap gap-3">
                {data.subCategory.map((c, index) => {
                  return (
                    <div
                      key={c._id + index + "productsection"}
                      className="text-sm flex items-center gap-1 bg-blue-50 mt-2"
                    >
                      <p>{c.name}</p>
                      <div
                        className="hover:text-red-500 cursor-pointer"
                        onClick={() => handleRemoveSubCategory(index)}
                      >
                        <IoClose size={20} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-1">
            <label htmlFor="unit" className="font-medium">
              Unit
            </label>
            <input
              id="unit"
              type="text"
              placeholder="Enter product unit"
              name="unit"
              value={data.unit}
              onChange={handleChange}
              required
              className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="stock" className="font-medium">
              Number of Stock
            </label>
            <input
              id="stock"
              type="number"
              placeholder="Enter product stock"
              name="stock"
              value={data.stock}
              onChange={handleChange}
              required
              className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="price" className="font-medium">
              Price
            </label>
            <input
              id="price"
              type="number"
              placeholder="Enter product price"
              name="price"
              value={data.price}
              onChange={handleChange}
              required
              className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="discount" className="font-medium">
              Discount
            </label>
            <input
              id="discount"
              type="number"
              placeholder="Enter product discount"
              name="discount"
              value={data.discount}
              onChange={handleChange}
              required
              className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
            />
          </div>

          {/* Variation input fields */}

          <div className="grid gap-1">
            <label className="font-medium">Variations</label>

            {data.variations.map((variation, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Size"
                  value={variation.option}
                  onChange={(e) =>
                    handleVariationChange(index, "option", e.target.value)
                  }
                  required
                  className="bg-blue-50 p-2 outline-none border rounded"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={variation.price}
                  onChange={(e) =>
                    handleVariationChange(index, "price", e.target.value)
                  }
                  required
                  className="bg-blue-50 p-2 outline-none border rounded"
                />
                <button
                  type="button"
                  onClick={() => removeVariation(index)}
                  className="text-red-500"
                >
                  <IoClose size={20} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addVariation}
              className="bg-blue-500 text-white px-2 py-1 rounded w-[230px] mt-2"
            >
              + Add Variation
            </button>
          </div>

          <button className="bg-primary-100 hover:bg-primary-200 py-2 rounded font-semibold">
            Submit
          </button>
        </form>
      </div>

      {ViewImageURL && (
        <ViewImage url={ViewImageURL} close={() => setViewImageURL("")} />
      )}
    </section>
  );
};

export default UploadProduct;
