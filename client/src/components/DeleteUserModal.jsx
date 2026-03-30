import React from 'react';
import { ShieldAlert, Trash2, X } from 'lucide-react';

const DeleteUserModal = ({ username, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-dark-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dark-card border border-dark-border rounded-3xl w-full max-w-md shadow-2xl p-8 animate-fade-in">
                <div className="flex flex-col items-center text-center">
                    <div className="p-4 bg-red-500/10 rounded-full text-red-500 mb-6">
                        <ShieldAlert size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Delete User?</h2>
                    <p className="text-dark-muted mb-8 leading-relaxed">
                        Are you sure you want to delete <span className="text-white font-bold">{username}</span>? This action is <span className="text-white font-bold text-red-400">permanent</span> and will delete all their <span className="font-bold">Projects, Notes, and Files</span>.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 w-full">
                        <button
                            onClick={onCancel}
                            className="w-full py-3 bg-dark-border border border-dark-card text-dark-muted rounded-xl hover:bg-dark-card hover:text-white transition-all font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all shadow-lg hover:shadow-red-500/20 font-bold flex items-center justify-center space-x-2"
                        >
                            <Trash2 size={18} />
                            <span>Confirm Delete</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteUserModal;