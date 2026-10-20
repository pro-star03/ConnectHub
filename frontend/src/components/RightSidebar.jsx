import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getTrendingTags } from '../services/postService';
import { TrendingUp } from 'lucide-react';

const RightSidebar = () => {
  const { user } = useContext(AuthContext);
  const [trendingTags, setTrendingTags] = useState([]);

  useEffect(() => {
    if (!user?._id) return;

    // Fetch trending tags
    getTrendingTags()
      .then(res => {
        setTrendingTags(res.data || []);
      })
      .catch(console.error);
  }, [user?._id]);

  return (
    <aside className="w-80 hidden lg:flex flex-col gap-5 pt-4 pb-12 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto no-scrollbar">
      {/* Trending Section */}
      <div className="bg-base-100 border border-base-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-base-200/70">
          <TrendingUp size={18} className="text-primary" />
          <h3 className="font-bold text-sm tracking-tight">Trending Topics</h3>
        </div>

        {trendingTags.length === 0 ? (
          <p className="text-xs text-base-content/50 py-2">No trending tags yet. Post with #hashtags!</p>
        ) : (
          <div className="space-y-2.5">
            {trendingTags.slice(0, 5).map(({ tag, count }) => (
              <Link 
                key={tag} 
                to={`/search?q=${encodeURIComponent('#' + tag)}`}
                className="group block py-1 px-1.5 rounded-lg hover:bg-base-200/50 transition-colors"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold group-hover:text-primary transition-colors">
                    #{tag}
                  </span>
                  <span className="text-[11px] text-base-content/50">
                    {count} {count === 1 ? 'post' : 'posts'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <footer className="text-[11px] text-base-content/40 px-2 space-y-1">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <Link to="/settings" className="hover:underline">Settings</Link>
          <Link to="/settings" className="hover:underline">Help & Support</Link>
          <Link to="/saved" className="hover:underline">Saved Posts</Link>
        </div>
        <p>© 2026 ConnectHub Inc. All rights reserved.</p>
      </footer>
    </aside>
  );
};

export default RightSidebar;
