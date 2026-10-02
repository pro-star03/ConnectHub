import { useNavigate } from 'react-router-dom';
import CreatePostBox from '../components/CreatePostBox';
import { PlusSquare } from 'lucide-react';

const CreatePost = () => {
  const navigate = useNavigate();

  const handlePostCreated = (newPost) => {
    // Navigate back to home when post is created
    navigate('/');
  };

  return (
    <div className="pt-4 sm:pt-6 max-w-xl mx-auto px-4 sm:px-0">
      <div className="flex items-center gap-2 mb-6">
        <PlusSquare size={24} className="text-primary" />
        <h1 className="text-2xl font-bold">Create New Post</h1>
      </div>
      
      <CreatePostBox onPostCreated={handlePostCreated} />
    </div>
  );
};

export default CreatePost;
