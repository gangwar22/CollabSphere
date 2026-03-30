import React from 'react';
import { Link } from 'react-router-dom';
import { GitBranch, Globe, Lock, Star, Circle } from 'lucide-react';

const ProjectCard = ({ project, onDelete, currentUser }) => {
  const isOwner =
    currentUser &&
    (project.owner === currentUser._id || project.owner?._id === currentUser._id);

  const getLanguageColor = () => {
    const colors = ['#f1e05a', '#563d7c', '#e34c26', '#3178c6', '#41b883'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="github-card p-4 flex flex-col h-full bg-dark-card hover:bg-dark-hover transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <GitBranch size={16} className="text-dark-muted shrink-0" />
          <Link
            to={`/project/${project._id}`}
            className="text-primary-500 font-bold hover:underline truncate text-base"
          >
            {project.projectName}
          </Link>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-dark-border text-dark-muted">
            {project.isPublic ? 'Public' : 'Private'}
          </span>
        </div>
      </div>

      <p className="text-dark-muted text-xs line-clamp-2 mb-4 flex-1">
        {project.description || "No description provided."}
      </p>

      <div className="flex items-center gap-4 text-[10px] text-dark-muted font-medium">
        <div className="flex items-center gap-1.5">
          <Circle size={10} fill={getLanguageColor()} className="border-0" style={{ color: getLanguageColor() }} />
          <span>JavaScript</span>
        </div>
        
        <div className="flex items-center gap-1 hover:text-primary-500 cursor-pointer transition-colors">
          <Star size={12} />
          <span>0</span>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            {project.members.slice(0, 3).map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full bg-dark-border border border-dark-card flex items-center justify-center text-[8px] font-bold text-dark-text"
              >
                {i + 1}
              </div>
            ))}
          </div>
          {project.members.length > 3 && (
            <span className="ml-1">+{project.members.length - 3}</span>
          )}
        </div>

        <span className="ml-auto">Updated recently</span>
      </div>
    </div>
  );
};

export default ProjectCard;