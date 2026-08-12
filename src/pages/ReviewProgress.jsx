import { useEffect, useRef, useState } from 'react';
import './ReviewProgress.css';

function ReviewProgress({ jobId, onComplete }) {
    const [progress, setProgress] = useState({
        processed: 0,
        total: 0,
        percent: 0,
        currentFile: 'Connecting...',
        status: 'CLONING'
    });
    const eventSourceRef = useRef(null);

    useEffect(() => {
        if (!jobId) return;

        const token = localStorage.getItem('token');
        const es = new EventSource(
            `${process.env.REACT_APP_API_URL}/api/reviews/${jobId}/progress?token=${token}`
        );
        eventSourceRef.current = es;

        es.addEventListener('progress', (e) => {
            setProgress(JSON.parse(e.data));
        });

        es.addEventListener('complete', () => {
            es.close();
            onComplete(jobId);
        });

        es.addEventListener('error', () => {
            es.close();
            onComplete(jobId);
        });

        es.onerror = () => es.close();

        return () => es.close();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jobId]);

    const getStatusLabel = () => {
        if (progress.status === 'CLONING') return '📦 Cloning repository...';
        if (progress.total === 0) return '📂 Extracting files...';
        return `🤖 Reviewing files...`;
    };

    return (
        <div className="review-progress">
            <div className="progress-status">
                {getStatusLabel()}
            </div>

            {progress.total > 0 && (
                <>
                    <div className="progress-bar-row">
                        <div className="progress-bar-track">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${progress.percent}%` }}
                            />
                        </div>
                        <div className="spinner" />
                    </div>

                    <div className="progress-info">
                    <span className="progress-count">
                        {progress.processed}/{progress.total} files
                    </span>
                        <span className="progress-percent">{progress.percent}%</span>
                    </div>

                    <div className="progress-current-file">
                        {progress.currentFile}
                    </div>
                </>
            )}

            {progress.total === 0 && (
                <div className="progress-bar-row">
                    <div className="progress-bar-track">
                        <div className="progress-bar-indeterminate" />
                    </div>
                    <div className="spinner" />
                </div>
            )}
        </div>
    );
}

export default ReviewProgress;