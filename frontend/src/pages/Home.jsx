import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Home({ addToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Just fetch all products, we will slice them for display
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary-600 text-lg font-medium animate-pulse">
            Memuat...
          </p>
        </div>
      </div>
    );
  }

  // Take only first 4-8 products for "Featured" section
  const featuredProducts = products.slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden pt-20">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-50 to-white rounded-b-[50px] -z-10"></div>
      <div className="absolute top-0 right-0 w-3/4 h-[600px] bg-gradient-to-bl from-indigo-50/50 to-transparent rounded-bl-full -z-10"></div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-slide-up pt-12">
          <div className="inline-flex items-center gap-2 bg-white border border-blue-100 px-4 py-1.5 rounded-full text-blue-800 text-sm font-bold mb-6 shadow-sm">
            <span className="text-yellow-500 text-lg">🔥</span>
            <span>Solusi Gas & Dapur UMKM No.1</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-primary-900 mb-6 font-display leading-tight tracking-tight">
            Gas Asli, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">Harga Pasti</span>, <br />
            Kualitas Terjamin.
          </h1>
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            Platform terpercaya yang menghubungkan UMKM dengan vendor gas resmi.
            Aman, cepat, dan transparan.
          </p>
          
          <div className="flex justify-center gap-4">
            <Link 
              to="/products"
              className="bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl px-8 py-4 text-lg transition-all hover:transform hover:scale-105 shadow-lg shadow-accent-500/30"
            >
              Belanja Sekarang
            </Link>
             <Link 
              to="/products"
              className="bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl px-8 py-4 text-lg transition-all border border-gray-200 shadow-sm"
            >
              Cari Agen
            </Link>
          </div>
        </div>

        {/* Key Features Section */}
        <div className="mb-24">
            <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                        🛡️
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Agen Terverifikasi</h3>
                    <p className="text-gray-500 leading-relaxed">
                        Kami hanya bekerja sama dengan agen gas resmi dan terpercaya untuk menjamin kualitas dan keamanan produk.
                    </p>
                </div>
                <div className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                     <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                        ⚡
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Pengiriman Cepat</h3>
                    <p className="text-gray-500 leading-relaxed">
                        Pesan gas sekarang, langsung diantar ke lokasi Anda. Temukan agen terdekat untuk layanan kilat.
                    </p>
                </div>
                <div className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                     <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                        💯
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Harga Transparan</h3>
                    <p className="text-gray-500 leading-relaxed">
                        Harga sesuai HET (Harga Eceran Tertinggi) resmi. Tidak ada biaya tersembunyi.
                    </p>
                </div>
            </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-24">
            <div className="text-center mb-12">
                 <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-display">Cara Pesan di GasKu</h2>
                 <p className="text-gray-500">Mudah dan cepat, hanya dalam 3 langkah sederhana</p>
            </div>
           
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 relative max-w-5xl mx-auto">
                 {/* Connection Line (Desktop) */}
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 -translate-y-1/2"></div>
                {/* Steps */}
                {[
                  { num: 1, title: "Cari Lokasi", desc: "Temukan agen terdekat di sekitar Anda." },
                  { num: 2, title: "Pilih Produk", desc: "Pilih gas sesuai kebutuhan Anda." },
                  { num: 3, title: "Terima Pesanan", desc: "Kurir mengantar langsung ke dapur Anda." }
                ].map((step) => (
                    <div key={step.num} className="bg-white p-6 rounded-2xl shadow-sm relative w-full md:w-1/3 text-center border border-gray-100 hover:border-primary-100 transition-colors">
                        <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 ring-4 ring-primary-50">
                            {step.num}
                        </div>
                        <h4 className="text-lg font-bold mb-2">{step.title}</h4>
                        <p className="text-sm text-gray-500">{step.desc}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Featured Products */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-8">
            <div>
               <h2 className="text-3xl font-bold text-gray-900 mb-2 font-display">Produk Pilihan</h2>
               <p className="text-gray-500">Stok sedia untuk kebutuhan Anda</p>
            </div>
            <Link to="/products" className="text-primary-600 font-bold hover:text-primary-700 hover:underline">
               Lihat Semua &rarr;
            </Link>
          </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
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
                     {/* Badge Stok Habis */}
                     {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">Stok Habis</span>
                        </div>
                     )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                             <span>🏪</span> {product.vendor?.storeName || product.vendorStoreName || "Official Store"}
                        </div>
                        <div className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            Terjual {product.soldCount || 0}
                        </div>
                    </div>
                    
                    <h3 className="font-bold text-gray-800 mb-1 truncate">{product.name}</h3>
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
        </div>
      </div>
    </div>
  );
}

export default Home;
