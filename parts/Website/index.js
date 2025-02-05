

import AnchorButton from 'components/AnchorButton';
import LinkIcon from 'public/assets/svgs/icons/link.svg';

const Website = ({ href }) => (
  
  <>
    {href && (
      
      <AnchorButton
        anchorProps={{
          href:`watch?movie=${href}`,
          rel: 'noopener noreferrer'
        }}
        buttonProps={{
          title: 'Watch Now',
          endIcon: (
            <LinkIcon
              fill='currentColor'
              width='1em' />
          )
        }} />
    )}
  </>
);

export default Website;
