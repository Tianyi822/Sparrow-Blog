import './Background.scss';

interface BackgroundProps {
  backgroundImage: string;
}

const Background = ({ backgroundImage }: BackgroundProps) => {
  return (
    <div className='background-container'>
      <div
        className='bg-image'
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className='bg-overlay' />
    </div>
  );
};

export default Background;
