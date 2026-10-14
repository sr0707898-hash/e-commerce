
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import Category from '../category/category';

import Hero from "../hero/Hero"
import Values from '../values/values';
import Product from '../products/product';
import Discount from '../discount/discount';
import Process from '../process/process';
const Testimonials = lazy(() => import('../testimonials/testimonials'));

const DeferredTestimonials = () => {
  const containerRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!containerRef.current || shouldRender) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setShouldRender(true);
        observer.disconnect();
      }
    }, { rootMargin: '300px 0px' });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [shouldRender]);

  return (
    <div ref={containerRef} className="min-h-122.5">
      {shouldRender && (
        <Suspense fallback={<div className="min-h-122.5" aria-busy="true" />}>
          <Testimonials />
        </Suspense>
      )}
    </div>
  );
};

const Home = () => {
  return (
    <div>
    
    <Hero />
    <Category />
    <Values />
    <Product />
    <Discount />
    <Process />
    <DeferredTestimonials />
    
    </div>
  )
}

export default Home
