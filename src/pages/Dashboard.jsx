import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./Dashboard.css";

function Dashboard() {
  const [items, setItems] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    discountpercentage: "",
  });

  const [files, setFiles] = useState([]); // ✅ ONLY MULTIPLE IMAGES

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dropdownRef = useRef();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const res = await API.get("/items");
    setItems(res.data || []);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ MULTIPLE IMAGE UPLOAD
  const uploadImages = async () => {
    if (!files.length) return [];

    const urls = [];

    for (let file of files) {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "grameenkart");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dmbqt5315/image/upload",
        { method: "POST", body: data }
      );

      const result = await res.json();
      urls.push(result.secure_url);
    }

    return urls;
  };

  const handleAddItem = async () => {
    setLoading(true);

    const imageUrls = await uploadImages();

    await API.post("/item-insert", {
      ...form,
      price: Number(form.price),
      discountpercentage: Number(form.discountpercentage),
      image: imageUrls[0], // ✅ MAIN IMAGE
      images: imageUrls,   // ✅ ALL IMAGES
      created_by: user.email,
    });

    setForm({ name: "", description: "", price: "", discountpercentage: "" });
    setFiles([]); // reset
    setShowForm(false);

    fetchItems();
    setLoading(false);
  };

  const filteredItems = searchEmail
    ? items.filter((item) => item.created_by === searchEmail)
    : items;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const firstLetter = user?.email?.charAt(0)?.toUpperCase() || "U";

  const cropToSquare = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;

        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);

        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        }, "image/jpeg", 0.9);
      };
    });
  };

  return (
    <div className="dashboard-container">
      <div className="top-navbar">
        <div className="nav-left">
          <h1 className="logo">GrameenKart</h1>
        </div>

        <div className="nav-search">
          <input
            placeholder="Search..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />
        </div>

        <div className="nav-right">
          <button className="add-btn-top" onClick={() => setShowForm(true)}>
            + Add
          </button>

          <div className="cart-icon">
            🛒
            <span className="cart-count">2</span>
          </div>

          <div className="profile-wrapper" ref={dropdownRef}>
            <div
              className="profile-avatar"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {firstLetter}
            </div>

            {showDropdown && (
              <div className="profile-dropdown">
                <p className="dropdown-item">Profile</p>
                <p className="dropdown-item">Update</p>
                <p className="dropdown-item logout" onClick={handleLogout}>
                  Logout
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Product</h3>

            <input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} />
            <input name="price" placeholder="Price" value={form.price} onChange={handleChange} />

            <input
              name="discountpercentage"
              placeholder="Discount %"
              value={form.discountpercentage}
              onChange={handleChange}
            />

            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />

            {/* ✅ SINGLE CLEAN INPUT (MULTIPLE FILES) */}
            <input
              type="file"
              multiple
              onChange={async (e) => {
                const selectedFiles = Array.from(e.target.files);

                const croppedFiles = await Promise.all(
                  selectedFiles.map((f) => cropToSquare(f))
                );

                setFiles(croppedFiles);
              }}
            />

            {/* ✅ PREVIEW SCROLL */}
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginTop: "10px" }}>
              {files.map((f, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(f)}
                  style={{ width: 60, height: 60, borderRadius: 6 }}
                />
              ))}
            </div>

            <button onClick={handleAddItem}>
              {loading ? "Uploading..." : "Add Item"}
            </button>

            <button className="close-btn" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      <div className="items-grid">
        {filteredItems.map((item) => {
          console.log("ITEM:", item);
          console.log("IMAGES:", item.images);
          const discount = Number(item.discountpercentage) || 0;
          const price = Number(item.price) || 0;
          const discountedPrice = price - (price * discount) / 100;

          return (
            <div
              className="product-card"
              key={item.id}
              onClick={() => navigate(`/item/${item.id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="image-wrapper">
                {/* <img src={item.image} alt={item.name} /> */}
                <div className="image-scroll">
                  {(item.images && item.images.length > 0
                    ? item.images
                    : [item.image]
                  ).map((img, index) => (
                    <img key={index} src={img} alt={item.name} />
                  ))}
                </div>
                <span className="badge">{discount}% OFF</span>
                <span className="time-badge">⭐ 4.5</span>
                <button className="add-btn-small">ADD</button>
              </div>

              <div className="product-info">
                <div className="price-row">
                  <div>
                    <span className="price">₹{Math.round(discountedPrice)}</span>
                    {discount > 0 && (
                      <span className="old-price">₹{price}</span>
                    )}
                  </div>
                  <p style={{ fontWeight: 500, color: "#999" }}>1 Pc</p>
                </div>
                <h5 className="product-info-name">{item.name}</h5>
                <p className="desc">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;