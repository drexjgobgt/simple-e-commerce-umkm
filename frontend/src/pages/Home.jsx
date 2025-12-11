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
      <div className="min-h-screen flex items-center justify-center bg-primary-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary-600 text-lg font-medium animate-pulse">
            Memuat produk...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden pt-20">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-b-[40px] shadow-2xl -z-10"></div>
      <div className="absolute top-20 right-0 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
      <div className="absolute top-40 left-0 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl -z-10"></div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-white text-sm font-medium mb-6">
            <span className="text-accent-300">🔥</span>
            <span>Solusi Gas & Dapur UMKM No.1</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-display leading-tight">
            Gas Asli, <span className="text-accent-400">Harga Pasti</span>, <br />
            Kualitas Terjamin.
          </h1>
          <p className="text-primary-100 text-lg md:text-xl max-w-2xl mx-auto mb-8 font-light">
            Platform terpercaya yang menghubungkan UMKM dengan vendor gas resmi.
            Aman, cepat, dan transparan.
          </p>
          
          <div className="glass p-4 rounded-2xl max-w-4xl mx-auto shadow-2xl">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-3 flex items-center gap-3">
                 <div className="bg-primary-50 p-2 rounded-lg text-2xl">🏙️</div>
                 <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                    placeholder="Cari kota..."
                 />
              </div>
              <div className="bg-white rounded-xl p-3 flex items-center gap-3">
                 <div className="bg-primary-50 p-2 rounded-lg text-2xl">🎯</div>
                 <input
                    type="number"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(e.target.value)}
                    className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                    placeholder="Radius (km)"
                 />
              </div>
              <button 
                onClick={fetchProducts}
                className="bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl py-3 transition-all hover:transform hover:scale-[1.02] shadow-lg shadow-accent-500/30"
              >
                Cari Agen Terdekat
              </button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-12 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-4 justify-center min-w-max">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 whitespace-nowrap border ${
                  filter === cat
                    ? "bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-600/30 transform scale-105"
                    : "bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600"
                }`}
              >
                {cat === "all" ? "Semua Produk" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8" id="products">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="group bg-white rounded-2xl overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="absolute bottom-4 left-4 right-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                   <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className="w-full bg-white text-primary-700 py-2.5 rounded-xl font-bold shadow-lg hover:bg-primary-50 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                   >
                     {product.stock > 0 ? "Tambah ke Keranjang" : "Stok Habis"}
                   </button>
                </div>

                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary-700 shadow-sm">
                  {product.category}
                </div>

                {product.stock < 10 && product.stock > 0 && (
                   <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm animate-pulse">
                     Sisa {product.stock}
                   </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-[10px]">🏪</div>
                   <span className="text-xs text-gray-500 font-medium truncate">
                     {product.vendorStoreName || "Official Store"}
                   </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                  {product.name}
                </h3>
                
                <div className="flex items-end justify-between mt-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Harga per unit</p>
                    <div className="text-2xl font-bold text-primary-600 font-display">
                      Rp {product.price.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <Link 
                    to={`/product/${product._id}`}
                    className="w-10 h-10 rounded-full bg-gray-50 hover:bg-accent-50 flex items-center justify-center text-gray-400 hover:text-accent-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-lg">
            <div className="text-6xl mb-4 grayscale opacity-50">📦</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2 font-display">
              Produk Tidak Ditemukan
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Maaf, kami tidak dapat menemukan produk yang sesuai dengan kriteria pencarian Anda.
            </p>
            <button 
               onClick={() => {setFilter("all"); setCity(""); setRadiusKm("");}}
               className="mt-6 text-primary-600 font-medium hover:underline"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
