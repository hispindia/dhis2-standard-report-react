const withReportContainer = (Component) => {
  const WrappedComponent = (props) => {
    return (
      <div style={{ width: "100%", height: "100%", overflow: "auto" }}>
        <Component {...props} />
      </div>
    );
  };
  return WrappedComponent;
};
export default withReportContainer;
