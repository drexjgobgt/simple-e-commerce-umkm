import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Home({ addToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  const filteredProducts =
    filter === "all" ? products : products.filter((p) => p.category === filter);

  const categories = [
    "all",
    "Gas 3kg",
    "Gas 5kg",
    "Gas 12kg",
    "Kompor",
    "Selang",
    "Regulator",
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-2xl p-12 mb-12 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            🔥 Toko Gas UMKM
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
            Menyediakan gas LPG dan perlengkapan berkualitas untuk kebutuhan
            rumah tangga Anda dengan harga terjangkau dan layanan prima
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-6 py-3">
              <span className="text-lg font-semibold">🚚 Pengiriman Cepat</span>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-6 py-3">
              <span className="text-lg font-semibold">
                ⭐ Produk Berkualitas
              </span>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-6 py-3">
              <span className="text-lg font-semibold">💰 Harga Terbaik</span>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-yellow-400 rounded-full opacity-20"></div>
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-orange-400 rounded-full opacity-20"></div>
      </div>

      {/* Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full transition ${
                filter === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {cat === "all" ? "Semua Produk" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredProducts.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100"
          >
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-56 object-cover"
              />
              <div className="absolute top-3 left-3 bg-white bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700">
                {product.category}
              </div>
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-bold text-lg bg-red-600 px-4 py-2 rounded-full">
                    Stok Habis
                  </span>
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3 text-gray-900 line-clamp-1">
                {product.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                {product.description}
              </p>

              <div className="flex justify-between items-center mb-4">
                <div className="text-3xl font-bold text-blue-600">
                  Rp {product.price.toLocaleString("id-ID")}
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    product.stock > 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.stock > 0 ? `Stok: ${product.stock}` : "Habis"}
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  to={`/product/${product._id}`}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-xl text-center font-semibold transition-all duration-200 hover:shadow-md"
                >
                  👁️ Detail
                </Link>
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                    product.stock > 0
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-lg"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {product.stock > 0 ? "🛒 + Keranjang" : "❌ Habis"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          Tidak ada produk ditemukan
        </div>
      )}
    </div>
  );
}

export default Home;
