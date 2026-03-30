import React from 'react';
import { Link } from 'react-router-dom';
import { Folder, Globe, Lock, ArrowRight, Trash2 } from 'lucide-react';

const ProjectCard = ({ project, onDelete, currentUser }) => {
  const isOwner =
    currentUser &&
    (project.owner === currentUser._id || project.owner?._id === currentUser._id);

  return (
    <div className="glass p-6 rounded-2xl hover:border-primary-500/50 transition-all duration-300 group relative">
      
      <div className="flex justify-between items-start mb-4">
        
        <div className="p-3 bg-primary-500/10 rounded-xl text-primary-500">
          <Folder size={24} />
        </div>

        <div className="flex items-center space-x-2">
          
          <div className="flex items-center space-x-2 text-dark-muted text-xs">
            {project.isPublic ? (
              <span className="flex items-center bg-green-500/10 text-green-500 px-2 py-1 rounded-full">
                <Globe size={12} className="mr-1" /> Public
              </span>
            ) : (
              <span className="flex items-center bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full">
                <Lock size={12} className="mr-1" /> Private
              </span>
            )}
          </div>

        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
        {project.projectName}
      </h3>

      <p className="text-dark-muted text-sm line-clamp-2 mb-6">
        {project.description}
      </p>

      <div className="flex items-center justify-between mt-auto">

        <div className="flex items-center -space-x-2">
          {project.members.slice(0, 3).map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-dark-border border-2 border-dark-card flex items-center justify-center text-xs font-bold text-primary-500"
            >
              U{i + 1}
            </div>
          ))}

          {project.members.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-dark-border border-2 border-dark-card flex items-center justify-center text-[10px] font-bold text-dark-muted">
              +{project.members.length - 3}
            </div>
          )}
        </div>

        <Link
          to={`/project/${project._id}`}
          className="flex items-center text-primary-500 hover:text-primary-400 font-medium text-sm transition-colors"
        >
          View Project <ArrowRight size={16} className="ml-1" />
        </Link>

      </div>
    </div>
  );
};

export default ProjectCard;