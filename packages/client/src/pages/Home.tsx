import React from 'react';

import { usePageTitle } from '../hooks';
import { Navigate } from 'react-router-dom';

function Home() {
  usePageTitle('STAC Admin');

  return <Navigate to='/collections' replace />;
}

export default Home;
