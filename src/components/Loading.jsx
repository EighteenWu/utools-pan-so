export default function Loading({ text = "加载中..." }) {
  return (
    <div className="loading">
      <div className="loading-spinner"></div>
      <div>{text}</div>
    </div>
  );
} 