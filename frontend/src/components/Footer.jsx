import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="text-2xl font-display font-bold text-gray-900 mb-4 inline-block">
                            Gas<span className="text-primary-600">Ku</span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            Platform terpercaya untuk pemesanan gas LPG. Menghubungkan UMKM dan rumah tangga dengan agen resmi terdekat.
                        </p>
                        <div className="flex gap-4">
                           <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all cursor-pointer shadow-sm hover:shadow-md">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.407-.06 3.808-.06zm0 1.838h-2.548c-2.097 0-2.573.008-3.042.029-.614.03-1.049.133-1.45.289-.533.207-.936.491-1.272.827-.336.336-.62.739-.827 1.272-.156.401-.259.836-.289 1.45-.021.469-.029.945-.029 3.042v2.548c0 2.097.008 2.573.029 3.042.03.614.133 1.049.289 1.45.207.533.491.936.827 1.272.336.336.739.62 1.272.827.401.156.836.259 1.45.289.469.021.945.029 3.042.029h2.548c2.097 0 2.573-.008 3.042-.029.614-.03 1.049-.133 1.45-.289.533-.207.936-.491 1.272-.827.336-.336.62-.739.827-1.272.156-.401.259-.836.289-1.45.021-.469.029-.945.029-3.042v-2.548c0-2.097-.008-2.573-.029-3.042-.03-.614-.133-1.049-.289-1.45-.207-.533-.491-.936-.827-1.272-.336-.336-.739-.62-1.272-.827-.401-.156-.836-.259-1.45-.289-.469-.021-.945-.029-3.042-.029zM12.315 6.878a5.118 5.118 0 110 10.237 5.118 5.118 0 010-10.237zm0 1.838a3.28 3.28 0 100 6.56 3.28 3.28 0 000-6.56zM17.375 5.48a1.226 1.226 0 110 2.451 1.226 1.226 0 010-2.451z" clipRule="evenodd" /></svg>
                           </a>
                           <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-sm hover:shadow-md">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                           </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Menu Cepat</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link to="/" className="hover:text-primary-600 transition-colors">Beranda</Link></li>
                            <li><Link to="/products" className="hover:text-primary-600 transition-colors">Produk</Link></li>
                            <li><Link to="/orders/history" className="hover:text-primary-600 transition-colors">Riwayat Pesanan</Link></li>
                            <li><Link to="/login" className="hover:text-primary-600 transition-colors">Masuk / Daftar</Link></li>
                        </ul>
                    </div>

                     {/* Support */}
                     <div>
                        <h4 className="font-bold text-gray-900 mb-6">Bantuan</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-primary-600 transition-colors">Pusat Bantuan</a></li>
                            <li><a href="#" className="hover:text-primary-600 transition-colors">Syarat & Ketentuan</a></li>
                            <li><a href="#" className="hover:text-primary-600 transition-colors">Kebijakan Privasi</a></li>
                            <li><a href="#" className="hover:text-primary-600 transition-colors">Hubungi Kami</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                         <h4 className="font-bold text-gray-900 mb-6">Hubungi Kami</h4>
                         <ul className="space-y-4 text-sm text-gray-500">
                            <li className="flex items-start gap-3">
                                <span className="text-lg">📍</span>
                                <span>Jl. Suka-Suka No. 123, Jakarta Selatan, Indonesia</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-lg">📧</span>
                                <span>support@gasku.com</span>
                            </li>
                             <li className="flex items-center gap-3">
                                <span className="text-lg">📞</span>
                                <span>+62 812-3456-7890</span>
                            </li>
                         </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-400">
                        © {new Date().getFullYear()} GasKu. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-gray-400">
                        <a href="#" className="hover:text-gray-600">Privacy Policy</a>
                        <a href="#" className="hover:text-gray-600">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
