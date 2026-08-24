import { useEffect, useState } from "react";

import { FaBoxOpen, FaShoppingBag } from "react-icons/fa";

import { getTopProducts } from "../../services/productService";

import "./TopSellingProducts.css";


function TopSellingProducts() {

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  useEffect(() => {

    const fetchTopProducts = async () => {

      try {

        setLoading(true);

        setError("");

        const response = await getTopProducts();

        setProducts(response?.data || []);

      } catch (error) {

        console.error(
          "Top Products Error:",
          error
        );

        setError(
          error.response?.data?.message ||
          "Failed to load top selling products."
        );

      } finally {

        setLoading(false);

      }

    };


    fetchTopProducts();

  }, []);


  return (

    <div className="top-products-card">

      <div className="top-products-header">

        <div>

          <h3>Top Selling Products</h3>

          <p>
            Best performing products
          </p>

        </div>

        <div className="top-products-icon">

          <FaShoppingBag />

        </div>

      </div>

      {loading && (

        <div className="top-products-loading">

          Loading products...

        </div>

      )}

      {!loading && error && (

        <div className="top-products-error">

          {error}

        </div>

      )}

      {!loading &&
        !error &&
        products.length === 0 && (

          <div className="top-products-empty">

            <FaBoxOpen />

            <p>
              No selling data available yet.
            </p>

          </div>

        )}

      {!loading &&
        !error &&
        products.length > 0 && (

          <div className="top-products-list">

            {products.map((product, index) => (

              <div
                className="top-product-item"
                key={product.id || product._id || index}
              >

                <div className="top-product-image">

                  {product.image ? (

                    <img
                      src={product.image}
                      alt={product.productName}
                    />

                  ) : (

                    <FaBoxOpen />

                  )}

                </div>

                <div className="top-product-details">

                  <h4>
                    {product.displayName ||
                      product.productName}
                  </h4>

                  <span>
                    {product.productCode}
                  </span>

                  <small>
                    {product.category?.categoryName ||
                      "Uncategorized"}
                  </small>

                </div>


                <div className="top-product-sales">

                  <strong>
                    {Number(
                      product.totalSold || 0
                    ).toLocaleString("en-IN")}
                  </strong>

                  <span>
                    Sold
                  </span>

                </div>

              </div>

            ))}

          </div>

        )}

    </div>

  );

}


export default TopSellingProducts;