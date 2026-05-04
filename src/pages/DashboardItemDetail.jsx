import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./DashboardItemDetail.css";

function DashboardItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);

  useEffect(() => {
    fetchItem();
  }, []);

  const fetchItem = async () => {
    const res = await API.get("/items"); // reuse existing API
    const found = res.data.find((i) => i.id === Number(id));
    setItem(found);
  };

  if (!item) return <div className="loader">Loading...</div>;

  const discount = Number(item.discountpercentage) || 0;
  const price = Number(item.price) || 0;
  const discountedPrice = price - (price * discount) / 100;
  const saved = price - discountedPrice;

  return (
    <div className="detail-container">

      {/* BACK */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="detail-wrapper">

        {/* IMAGE */}
        <div className="detail-image">
          <img src={item.image} alt={item.name} />

          {discount > 0 && (
            <span className="detail-discount">{discount}% OFF</span>
          )}
        </div>

        {/* INFO */}
        <div className="detail-info">
          <h2>{item.name}</h2>

          <p className="detail-desc">{item.description}</p>

          <div className="detail-price-box">
            <span className="detail-price">
              ₹{Math.round(discountedPrice)}
            </span>

            {discount > 0 && (
              <span className="detail-old-price">₹{price}</span>
            )}
          </div>

          {discount > 0 && (
            <p className="detail-save">Save ₹{Math.round(saved)}</p>
          )}

          <div className="detail-rating">⭐ 4.5 (120 reviews)</div>

          <button className="detail-add-btn">ADD TO CART</button>
        </div>
      </div>
    </div>
  );
}

export default DashboardItemDetail;