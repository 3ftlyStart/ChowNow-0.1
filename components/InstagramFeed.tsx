
import React, { useState } from 'react';
import { Instagram, Heart, MessageCircle, ExternalLink, X, Film, Play } from 'lucide-react';
import { InstagramPost, Reel } from '../types';

interface InstagramFeedProps {
  posts: InstagramPost[];
  reels?: Reel[];
}

export const InstagramFeed: React.FC<InstagramFeedProps> = ({ posts, reels = [] }) => {
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'reels'>('posts');

  const toggleLike = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (likedPosts.includes(id)) {
      setLikedPosts(prev => prev.filter(pId => pId !== id));
    } else {
      setLikedPosts(prev => [...prev, id]);
    }
  };

  return (
    <section className="bg-white py-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5 rounded-xl">
               <div className="bg-white p-2 rounded-[10px]">
                 <Instagram className="text-brand-dark" size={24} />
               </div>
            </div>
            <div>
              <h3 className="font-display font-bold text-2xl text-brand-dark leading-none">@ChowShoYummy</h3>
              <p className="text-gray-500 text-sm">Follow us for secret menu hacks!</p>
            </div>
          </div>
          
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-brand-dark font-bold px-6 py-2.5 rounded-full transition transform hover:-translate-y-0.5 shadow-sm"
          >
            <Instagram size={18} /> Follow Us <ExternalLink size={14} className="opacity-50" />
          </a>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-6 border-t border-gray-100">
            <div className="flex gap-8">
                <button 
                  onClick={() => setActiveTab('posts')}
                  className={`flex items-center gap-2 py-4 text-sm font-bold uppercase tracking-wide border-t-2 transition-colors ${activeTab === 'posts' ? 'border-brand-dark text-brand-dark' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    <Instagram size={16} /> Posts
                </button>
                <button 
                  onClick={() => setActiveTab('reels')}
                  className={`flex items-center gap-2 py-4 text-sm font-bold uppercase tracking-wide border-t-2 transition-colors ${activeTab === 'reels' ? 'border-brand-dark text-brand-dark' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    <Film size={16} /> Reels
                </button>
            </div>
        </div>

        {/* Content Area */}
        {activeTab === 'posts' && (
            <div className="flex overflow-x-auto pb-4 md:grid md:grid-cols-3 lg:grid-cols-6 gap-4 snap-x snap-mandatory no-scrollbar">
            {posts.map((post) => {
                const isLiked = likedPosts.includes(post.id);
                return (
                <div 
                    key={post.id} 
                    onClick={() => setSelectedPost(post)}
                    className="relative group flex-shrink-0 w-64 md:w-auto aspect-square rounded-xl overflow-hidden cursor-pointer snap-center animate-fade-in"
                >
                    <img 
                    src={`https://picsum.photos/seed/${post.seed}/400/400`} 
                    alt={post.caption}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white gap-2 backdrop-blur-[2px]">
                    <div className="flex gap-4 font-bold">
                        <button onClick={(e) => toggleLike(e, post.id)} className="flex items-center gap-1 hover:scale-110 transition">
                        <Heart size={20} fill={isLiked ? "#ef4444" : "transparent"} className={isLiked ? "text-red-500" : "text-white"} /> 
                        {post.likes + (isLiked ? 1 : 0)}
                        </button>
                        <span className="flex items-center gap-1"><MessageCircle size={20} fill="white" /> {post.comments}</span>
                    </div>
                    <p className="text-xs text-center px-4 font-medium opacity-90 line-clamp-2">{post.caption}</p>
                    </div>
                </div>
                );
            })}
            </div>
        )}

        {activeTab === 'reels' && (
            <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory no-scrollbar animate-fade-in">
                {reels.map((reel) => (
                    <div 
                        key={reel.id}
                        className="relative group flex-shrink-0 w-48 h-80 rounded-xl overflow-hidden cursor-pointer snap-center bg-gray-900"
                    >
                         <img 
                            src={`https://picsum.photos/seed/${reel.seed}/300/500`} 
                            alt={reel.caption}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Play size={48} fill="white" className="text-white drop-shadow-lg opacity-80 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white">
                             <div className="flex items-center gap-1 text-xs mb-1 font-bold">
                                 <Play size={10} fill="currentColor"/> {reel.views}
                             </div>
                             <p className="text-xs line-clamp-2 font-medium">{reel.caption}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}

      </div>

      {/* Post Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedPost(null)} />
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl max-w-2xl w-full flex flex-col md:flex-row animate-fade-in-up">
                <button onClick={() => setSelectedPost(null)} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 z-10">
                    <X size={20} />
                </button>
                <div className="w-full md:w-1/2 aspect-square">
                    <img 
                      src={`https://picsum.photos/seed/${selectedPost.seed}/600/600`} 
                      className="w-full h-full object-cover" 
                      alt="Post detail"
                    />
                </div>
                <div className="w-full md:w-1/2 p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
                        <div className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5 rounded-full">
                           <div className="bg-white p-0.5 rounded-full">
                               <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                   <Instagram size={16} />
                               </div>
                           </div>
                        </div>
                        <span className="font-bold text-sm">ChowShoYummy</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto mb-4">
                        <p className="text-gray-700 text-sm leading-relaxed">{selectedPost.caption}</p>
                        <div className="mt-4 space-y-2">
                             <p className="text-xs text-gray-500"><span className="font-bold text-gray-800">foodie_jane</span> Looks delicious! 😋</p>
                             <p className="text-xs text-gray-500"><span className="font-bold text-gray-800">burger_king_22</span> Is this available now?</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 mt-auto">
                        <div className="flex gap-4 mb-2">
                             <button onClick={(e) => toggleLike(e, selectedPost.id)} className="transition hover:scale-110">
                                <Heart size={24} fill={likedPosts.includes(selectedPost.id) ? "#ef4444" : "transparent"} className={likedPosts.includes(selectedPost.id) ? "text-red-500" : "text-gray-800"} />
                             </button>
                             <MessageCircle size={24} className="text-gray-800" />
                        </div>
                        <p className="font-bold text-sm mb-1">{selectedPost.likes + (likedPosts.includes(selectedPost.id) ? 1 : 0)} likes</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">2 HOURS AGO</p>
                    </div>
                </div>
            </div>
        </div>
      )}
    </section>
  );
};
