import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Home({ addToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [city, setCity] = useState("");
  const [radiusKm, setRadiusKm] = useState("");
  const [coords, setCoords] = useState({ lat: "", lng: "" });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`, {
        params: {
          category: filter !== "all" ? filter : undefined,
          city: city || undefined,
          lat: coords.lat || undefined,
          lng: coords.lng || undefined,
          radiusKm: radiusKm || undefined,
        },
      });
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Memuat produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section - Enhanced */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-3xl p-12 mb-12 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-semibold">
                🔥 UMKM Terpercaya
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 leading-tight">
              Toko Gas & Perlengkapan
              <span className="block text-yellow-300">Berkualitas Terbaik</span>
            </h1>
            <p className="text-xl text-blue-100 mb-6 max-w-2xl">
              Menyediakan gas LPG original dan perlengkapan dapur berkualitas
              tinggi dengan harga terjangkau
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-yellow-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>Kualitas Terjamin</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-yellow-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Pengiriman Cepat</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-yellow-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Harga Bersaing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section - Enhanced */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Kategori Produk
          </h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                  filter === cat
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-300"
                    : "bg-white text-gray-700 hover:bg-gray-100 shadow-md border border-gray-200"
                }`}
              >
                {cat === "all" ? "🏪 Semua Produk" : cat}
              </button>
            ))}
          </div>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Kota (opsional)
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border rounded-xl px-4 py-3"
                placeholder="contoh: Jakarta"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Radius (km) & koordinat
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(e.target.value)}
                  className="w-full border rounded-xl px-3 py-3"
                  placeholder="Radius"
                />
                <input
                  type="number"
                  step="any"
                  value={coords.lng}
                  onChange={(e) =>
                    setCoords((prev) => ({ ...prev, lng: e.target.value }))
                  }
                  className="w-full border rounded-xl px-3 py-3"
                  placeholder="Longitude"
                />
                <input
                  type="number"
                  step="any"
                  value={coords.lat}
                  onChange={(e) =>
                    setCoords((prev) => ({ ...prev, lat: e.target.value }))
                  }
                  className="w-full border rounded-xl px-3 py-3"
                  placeholder="Latitude"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Isi lat/lng + radius untuk filter jarak (opsional)
              </p>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchProducts}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                Terapkan Filter Lokasi
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="group bg-white rounded-2xl shadow-md hover:shadow-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              {/* VENDOR BADGE - TAMBAHKAN INI */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <span className="text-blue-600">🏪</span>
                <span>
                  Dijual oleh: <strong>{product.vendorStoreName}</strong>
                </span>
              </div>
              <div className="relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                    {product.category}
                  </span>
                </div>
                {product.stock > 0 && product.stock < 10 && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      Stok Terbatas
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold mb-2 text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Rp {product.price.toLocaleString("id-ID")}
                    </div>
                    <div className="text-xs text-gray-500">
                      per {product.unit}
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      product.stock > 10
                        ? "bg-green-100 text-green-700"
                        : product.stock > 0
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.stock > 0 ? `Stok: ${product.stock}` : "Habis"}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/product/${product._id}`}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 px-4 rounded-xl text-center font-medium transition-all duration-300 border border-gray-200"
                  >
                    Detail
                  </Link>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 px-4 rounded-xl font-medium transition-all duration-300 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
                  >
                    {product.stock > 0 ? "🛒 Keranjang" : "Habis"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Produk Tidak Ditemukan
            </h3>
            <p className="text-gray-600">
              Coba kategori lain atau kembali ke semua produk
            </p>
          </div>
        )}

        {/* Trust Badges */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="font-bold text-gray-800 mb-2">Pembayaran Aman</h3>
            <p className="text-gray-600 text-sm">
              Transaksi dilindungi dengan enkripsi tingkat bank
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="text-4xl mb-3">🚚</div>
            <h3 className="font-bold text-gray-800 mb-2">Gratis Ongkir</h3>
            <p className="text-gray-600 text-sm">
              Untuk pembelian minimal Rp 100.000
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="text-4xl mb-3">💯</div>
            <h3 className="font-bold text-gray-800 mb-2">Produk Original</h3>
            <p className="text-gray-600 text-sm">
              100% produk original dan berkualitas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
