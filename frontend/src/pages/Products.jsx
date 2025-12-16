import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Products({ addToCart }) {
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
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header & Search */}
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 font-display">Semua Produk</h1>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                        <div className="text-xl">🏙️</div>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full bg-transparent outline-none text-sm"
                            placeholder="Cari kota..."
                        />
                    </div>
                     <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                        <div className="text-xl">🎯</div>
                        <input
                            type="number"
                            value={radiusKm}
                            onChange={(e) => setRadiusKm(e.target.value)}
                            className="w-full bg-transparent outline-none text-sm"
                            placeholder="Radius (km)"
                        />
                    </div>
                     <button 
                        onClick={fetchProducts}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg py-3 transition-colors shadow-md shadow-primary-600/20"
                    >
                        Terapkan Filter
                    </button>
                </div>
            </div>

            {/* Categories */}
            <div className="overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-3">
                    {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${
                        filter === cat
                            ? "bg-primary-600 text-white border-primary-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600"
                        }`}
                    >
                        {cat === "all" ? "Semua" : cat}
                    </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                 {/* Badge Stok Habis */}
                 {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">Stok Habis</span>
                    </div>
                 )}

                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary-700 shadow-sm">
                  {product.category}
                </div>

                {product.stock < 10 && product.stock > 0 && (
                   <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                     Sisa {product.stock}
                   </div>
                )}
              </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                           <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-[10px]">🏪</div>
                           <span className="text-xs text-gray-500 font-medium truncate">
                             {product.vendor?.storeName || product.vendorStoreName || "Official Store"}
                           </span>
                        </div>
                        <div className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full whitespace-nowrap">
                            Terjual {product.soldCount || 0}
                        </div>
                    </div>
                
                    <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>
                    
                   <div className="text-lg font-bold text-primary-600 font-display mb-3">
                      Rp {product.price.toLocaleString("id-ID")}
                    </div>
                    
                    <div className="flex gap-2">
                         <Link
                            to={`/product/${product._id}`}
                            className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg font-bold text-xs hover:bg-blue-100 transition-colors text-center"
                        >
                            Detail
                        </Link>
                        <button
                            onClick={() => addToCart(product)}
                            disabled={product.stock === 0}
                            className="flex-[2] bg-primary-600 text-white py-2 rounded-lg font-bold shadow-md hover:bg-primary-700 transition-colors text-xs disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            {product.stock > 0 ? "Beli" : "Habis"}
                        </button>
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
              Coba ubah filter atau kata kunci pencarian Anda.
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

export default Products;
