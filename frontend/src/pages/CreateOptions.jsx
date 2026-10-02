import { useNavigate } from 'react-router-dom';
import { Image, Video, X } from 'lucide-react';

const CreateOptions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base-100 flex flex-col p-4 max-w-xl mx-auto border-x border-base-200">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Create</h1>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-circle">
          <X size={24} />
        </button>
      </div>

      <div className="flex flex-col gap-4 mt-12">
        <button 
          onClick={() => navigate('/create-post')} 
          className="btn h-32 bg-base-200 hover:bg-base-300 border-none flex flex-col gap-2 rounded-2xl"
        >
          <Image size={32} className="text-primary" />
          <span className="text-lg font-medium">Create Post</span>
        </button>

        <button 
          onClick={() => navigate('/create-story')} 
          className="btn h-32 bg-base-200 hover:bg-base-300 border-none flex flex-col gap-2 rounded-2xl"
        >
          <Video size={32} className="text-secondary" />
          <span className="text-lg font-medium">Create Story</span>
        </button>
      </div>
    </div>
  );
};

export default CreateOptions;
