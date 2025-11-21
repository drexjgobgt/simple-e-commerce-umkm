import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function ProductDetail({ addToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/${id}`);
      setProduct(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(`${quantity} ${product.name} ditambahkan ke keranjang!`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">Loading...</div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Produk tidak ditemukan</h2>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 mb-6 hover:bg-blue-50 px-4 py-2 rounded-lg"
      >
        ← Kembali ke Beranda
      </button>

      <div className="grid md:grid-cols-2 gap-10 bg-white rounded-2xl shadow-2xl p-10 border border-gray-100">
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-96 object-cover rounded-xl shadow-lg"
          />
          <div className="absolute top-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-gray-700 shadow-md">
            {product.category}
          </div>
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-xl">
              <span className="text-white font-bold text-2xl bg-red-600 px-6 py-3 rounded-full shadow-lg">
                Stok Habis
              </span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-4 text-gray-900 leading-tight">
              {product.name}
            </h1>

            <div className="text-5xl font-bold text-blue-600 mb-6">
              Rp {product.price.toLocaleString("id-ID")}
            </div>

            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold ${
                product.stock > 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {product.stock > 0 ? (
                <>
                  ✅ Stok: {product.stock} {product.unit}
                </>
              ) : (
                <>❌ Stok Habis</>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-3 text-gray-900">
              📋 Deskripsi Produk
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <h3 className="font-bold mb-2">Informasi Penjual</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Toko:</strong> {product.vendorStoreName}
              </p>
              {product.vendorPhone && (
                <p>
                  <strong>Telepon:</strong> {product.vendorPhone}
                </p>
              )}
              <p className="text-gray-600">
                {product.vendor?.storeDescription}
              </p>
            </div>
          </div>

          {product.stock > 0 && (
            <>
              <div className="bg-blue-50 rounded-xl p-6">
                <label className="block font-bold text-lg mb-4 text-gray-900">
                  🔢 Jumlah
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="bg-white hover:bg-gray-100 w-12 h-12 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md flex items-center justify-center font-bold text-xl"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold px-6 py-2 bg-white rounded-xl min-w-[4rem] text-center shadow-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="bg-white hover:bg-gray-100 w-12 h-12 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md flex items-center justify-center font-bold text-xl"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                >
                  🛒 Tambah ke Keranjang
                </button>
                <button
                  onClick={() => {
                    handleAddToCart();
                    navigate("/checkout");
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 rounded-xl font-bold text-lg transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                >
                  ⚡ Beli Sekarang
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
