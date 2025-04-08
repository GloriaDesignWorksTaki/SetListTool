
type H2itleProps = {
  title: string;
}

const H2itle: React.FC<H2itleProps> = ({ title }) => {
  return <h2 className="h2Title">{title}</h2>;
};

export default H2itle;