const GitHubRepoChecker = ({ handle }) => {
  const { checkRepoFork, hasForked, loading, error } = useCheckRepoFork();

  useEffect(() => {
    if (handle) {
      checkRepoFork(handle); // Call the function when the handle is available
    }
  }, [handle]); // Re-run when the handle changes

  return (
    <div>
      {loading && <p>Checking if the repo is forked...</p>}
      {error && <p>Error: {error}</p>}
      {hasForked === true && <p>You're FORKED!</p>}
      {hasForked === false && <p>You haven't forked the repo yet!</p>}
    </div>
  );
};

// Parent component
const App = () => {
  const [handle, setHandle] = useState(null); // State for GitHub handle

  // Fetch handle with GitHubHandleCollector and pass it down to GitHubRepoChecker
  return (
    <div>
      <GitHubHandleCollector setHandle={setHandle} />
      {handle && <GitHubRepoChecker handle={handle} />}
    </div>
  );
};
