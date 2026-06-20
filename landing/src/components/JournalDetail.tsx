import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

const articles: Record<string, {
  title: string
  tag: string
  date: string
  readTime: string
  video: string
  content: string[]
  sections: { heading: string; body: string }[]
}> = {
  'how-we-detect-exoplanets-with-machine-learning': {
    title: 'How We Detect Exoplanets with Machine Learning',
    tag: 'ML Pipeline',
    date: 'March 2026',
    readTime: '5 min read',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4',
    content: [
      'The transit method has been the most successful technique for discovering exoplanets, responsible for over 75% of all confirmed detections. When a planet passes in front of its host star, it blocks a tiny fraction of the starlight — typically 0.01% to 1% — creating a characteristic dip in the light curve.',
      'Our machine learning pipeline automates this detection process. Starting with raw stellar flux data from the Kepler mission, we apply a series of transformations: detrending to remove long-term stellar variability, Lomb-Scargle periodogram analysis to find the orbital period, and phase-folding to stack multiple transits into a single clean signal.',
      'The feature extraction stage computes over 20 engineered features — transit depth, duration, ingress/egress slope, flux statistics, skewness, and kurtosis — that capture the distinctive shape of a transit signal versus astrophysical noise.',
    ],
    sections: [
      {
        heading: 'The Model Architecture',
        body: 'Our ensemble approach combines Random Forest (200 trees, max depth 12) with XGBoost (200 estimators, max depth 8, learning rate 0.05). Training on 60 synthetic transit light curves and 60 pure-noise examples achieves a ROC-AUC of 0.96. The model generalizes well to real Kepler data, correctly classifying known exoplanet hosts like Kepler-10b and Kepler-22b.',
      },
      {
        heading: 'From Signal to Discovery',
        body: 'Once a candidate transit is classified, the pipeline estimates physical parameters using the batman package — a Python library for exoplanet transit light-curve modeling. This step determines the planet-to-star radius ratio, orbital inclination, and transit duration, transforming a statistical prediction into an astrophysical discovery.',
      },
    ],
  },
  'why-phase-folding-reveals-hidden-worlds': {
    title: 'Why Phase-Folding Reveals Hidden Worlds',
    tag: 'Signal Processing',
    date: 'February 2026',
    readTime: '4 min read',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4',
    content: [
      'Phase-folding is one of the most powerful techniques in exoplanet detection. By folding a light curve modulo the orbital period, we stack every transit on top of each other, amplifying the signal while reducing the noise.',
      'The key insight: a single transit dip might be indistinguishable from random stellar variability, but when you average 10, 50, or 100 transits together, the signal-to-noise ratio improves by the square root of the number of transits observed.',
    ],
    sections: [
      {
        heading: 'The Lomb-Scargle Connection',
        body: 'Before we can phase-fold, we need to know the orbital period. Finding this period is itself a computational challenge. The Lomb-Scargle periodogram computes a power spectrum across a range of candidate periods, identifying the most significant periodic signal in the data. For Kepler-10b with its 0.84-day orbit, the periodogram shows a clear peak — the planet whips around its star every 20 hours.',
      },
      {
        heading: 'Phase-Folding in Practice',
        body: 'Once the period is known, we fold the time series: each data point is mapped to a phase value between 0 and 1 based on its position within the orbital cycle. Binning these phases produces a clean, high-resolution transit profile. Our pipeline uses 200 bins per phase-fold, giving us enough resolution to measure the transit shape, depth, and duration with high precision.',
      },
    ],
  },
  'random-forest-vs-xgboost-for-transit-classification': {
    title: 'Random Forest vs XGBoost for Transit Classification',
    tag: 'Model Comparison',
    date: 'January 2026',
    readTime: '7 min read',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4',
    content: [
      'Choosing the right classifier for exoplanet transit detection is a tradeoff between interpretability, training speed, and predictive performance. We benchmarked Random Forest and XGBoost on our synthetic Kepler dataset — here is what we found.',
      'Random Forest: 200 trees with max depth 12, balanced class weights. Out-of-bag error provides a natural validation metric. Training time: ~2 seconds on 120 light curves. Feature importance is straightforward — transit depth and period rank highest.',
    ],
    sections: [
      {
        heading: 'XGBoost Performance',
        body: 'XGBoost: 200 estimators, max depth 8, learning rate 0.05. The gradient-boosted approach consistently edges out Random Forest by 1-2% in ROC-AUC, achieving 0.96 on held-out test data. The tradeoff: hyperparameter tuning requires more care (learning rate, subsample ratio, column sampling), and the model is slightly more prone to overfitting on small datasets.',
      },
      {
        heading: 'Ensemble Decision',
        body: 'Our production pipeline uses both models in a soft voting ensemble. When both classifiers agree on a prediction (confidence > 0.8), we flag the target for transit parameter estimation. This dual-model approach gives us the robustness of Random Forest with the edge performance of XGBoost, validated against confirmed Kepler planets including Kepler-186f, Kepler-62f, and Kepler-22b.',
      },
    ],
  },
  'kepler-186f-first-earth-sized-habitable-zone-planet': {
    title: 'Kepler-186f: The First Earth-Sized Habitable Zone Planet',
    tag: 'Astronomy',
    date: 'December 2025',
    readTime: '6 min read',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4',
    content: [
      'Discovered in 2014, Kepler-186f marked a milestone in exoplanet science: the first Earth-sized planet found orbiting within the habitable zone of another star. Located 500 light-years away in the constellation Cygnus, this world orbits an M-dwarf star — smaller and cooler than our Sun.',
      'With a radius of just 1.17 Earth radii and a 129.9-day orbit, Kepler-186f receives about one-third of the energy from its star that Earth receives from the Sun, placing it near the outer edge of the habitable zone.',
    ],
    sections: [
      {
        heading: 'Detection via Transit Method',
        body: 'Kepler-186f was detected using the transit method — the same technique our pipeline automates. The transit depth is only 0.08% (80 parts per million), meaning the planet blocks less than one-thousandth of its star\'s light. Detecting such a small signal requires folding over a year\'s worth of data to achieve sufficient signal-to-noise.',
      },
      {
        heading: 'Implications for Exoplanet Research',
        body: 'Kepler-186f demonstrates that Earth-sized planets in habitable zones are common. Our pipeline is designed to detect exactly these kinds of signals — small-radius, long-period transits that push the limits of current instrumentation. By training on real Kepler data and synthetic analogs, our models learn to recognize the subtle signature of a world like Kepler-186f hiding in the noise.',
      },
    ],
  },
}

export default function JournalDetail() {
  const { slug } = useParams<{ slug: string }>()
  const article = slug ? articles[slug] : null

  if (!article) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-display italic text-text-primary mb-4">Article not found</h1>
          <Link to="/" className="text-sm text-muted hover:text-text-primary underline">
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg pt-32 md:pt-40 pb-20">
      <article className="max-w-[800px] mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs text-muted hover:text-text-primary transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            Back to journal
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] text-muted uppercase tracking-[0.2em]">{article.tag}</span>
            <span className="text-[10px] text-muted/50">·</span>
            <span className="text-[10px] text-muted/50">{article.date}</span>
            <span className="text-[10px] text-muted/50">·</span>
            <span className="text-[10px] text-muted/50">{article.readTime}</span>
          </div>

          <h1 className="text-3xl md:text-5xl text-text-primary tracking-tight mb-8 leading-tight">
            {article.title}
          </h1>

          <div className="rounded-2xl overflow-hidden mb-10 aspect-video">
            <video
              src={article.video}
              className="w-full h-full object-cover"
              muted
              autoPlay
              loop
              playsInline
            />
          </div>

          {article.content.map((paragraph, i) => (
            <p key={i} className="text-sm md:text-base text-text-primary/70 leading-relaxed mb-6">
              {paragraph}
            </p>
          ))}

          {article.sections.map((section, i) => (
            <div key={i} className="mt-10 mb-8">
              <h2 className="text-xl md:text-2xl text-text-primary tracking-tight mb-4">
                {section.heading}
              </h2>
              <p className="text-sm md:text-base text-text-primary/70 leading-relaxed">
                {section.body}
              </p>
            </div>
          ))}

          <div className="mt-16 pt-8 border-t border-stroke">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-text-primary transition-colors"
            >
              <ArrowLeft size={14} />
              Back to all articles
            </Link>
          </div>
        </motion.div>
      </article>
    </div>
  )
}
