import { useState, useEffect } from 'react';

export const useCheckRepoFork = (handle) => {
  const [hasForked, setHasForked] = useState(null); // Start with null to indicate loading state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkRepoFork = async () => {
      const repoUrl = `https://api.github.com/repos/${handle}/ethbinder`;

      try {
        const response = await fetch(repoUrl);
        if (response.status === 200) {
          setHasForked(true); // Fork exists
        } else if (response.status === 404) {
          setHasForked(false); // Fork does not exist
        } else {
          throw new Error(`Unexpected status code: ${response.status}`);
        }
      } catch (err) {
        console.error('Error checking repo status:', err);
        setError(err.message);
        setHasForked(false); // On error, assume fork doesn't exist
      } finally {
        setLoading(false);
      }
    };

    if (handle) {
      checkRepoFork(); // Only check if handle is provided
    } else {
      setLoading(false);
      setHasForked(false); // No handle means no repo
    }
  }, [handle]);

  return { hasForked, loading, error };
};

