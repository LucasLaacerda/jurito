import { motion } from 'framer-motion';

interface LoadingDotsProps {
  color?: string;
  style?: 'small' | 'medium' | 'large';
}

const LoadingDots = ({ color = '#ffffff', style = 'medium' }: LoadingDotsProps) => {
  const size = style === 'small' ? 4 : style === 'large' ? 8 : 6;
  const spacing = style === 'small' ? 2 : style === 'large' ? 4 : 3;
  
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    },
    exit: { opacity: 0 }
  };
  
  const dotVariants = {
    initial: { y: 0, opacity: 0.5 },
    animate: { 
      y: [0, -10, 0],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    exit: { y: 0, opacity: 0 }
  };
  
  return (
    <motion.div
      className="flex items-center justify-center"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="rounded-full"
          style={{ 
            width: size, 
            height: size, 
            backgroundColor: color,
            margin: `0 ${spacing}px`
          }}
          variants={dotVariants}
        />
      ))}
    </motion.div>
  );
};

export default LoadingDots; 