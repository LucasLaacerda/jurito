import styles from "./loading-dots.module.css";

interface LoadingDotsProps {
  color?: string;
  style?: "small" | "large";
}

export default function LoadingDots({ color = "#fff", style = "small" }: LoadingDotsProps) {
  return (
    <span className={style === "small" ? styles.loading : styles.loading2}>
      <span style={{ backgroundColor: color }} />
      <span style={{ backgroundColor: color }} />
      <span style={{ backgroundColor: color }} />
    </span>
  );
}

LoadingDots.defaultProps = {
  color: "#fff",
  style: "small",
}; 