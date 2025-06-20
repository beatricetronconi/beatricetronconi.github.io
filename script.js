document.addEventListener('DOMContentLoaded', function () {
  const projects = [
    {
      linkId: 'ai-link',
      imgSelector: '.ai-preview img',
      images: ['ai5.jpg', 'ai1.jpg', 'ai3.jpg', 'ai7.jpg', 'ai8.png'],
      index: 0
    },
    {
      linkId: 'se-link',
      imgSelector: '.se-preview img',
      images: ['se9.jpg', 'se0.jpg', 'se1.jpg', 'se2.jpg', 'se3.jpg', 'se4.jpg', 'se5.jpg', 'se7.jpg', 'se8.jpg'],
      index: 0
    },
    {
      linkId: 'sd-link',
      imgSelector: '.sd-preview img',
      images: ['sd01.jpg', 'sd02.jpg', 'sd03.jpg', 'sd04.jpg', 'sd05.jpg', 'sd06.jpg', 'sd07.jpg', 'sd08.jpg', 'sd09.jpg', 'sd10.jpg', 'sd11.jpg', 'sd12.jpg', 'sd13.jpg'],
      index: 0
    },
    {
      linkId: 'ex-link',
      imgSelector: '.ex-preview img',
      images: ['ex4.jpg', 'ex1.jpg', 'ex2.jpg', 'ex5.jpg', 'ex6.jpg', 'ex7.jpg'],
      index: 0
    },
    {
      linkId: 'tr-link',
      imgSelector: '.tr-preview img',
      images: ['tr5.png', 'tr0.jpg', 'tr1.jpg', 'tr2.jpg', 'tr4-2.jpg', 'tr3.jpg', 'tr6.jpg', 'tr7.png', 'tr1.JPG'],
      index: 0
    },
    {
      linkId: 'ph-link',
      imgSelector: '.ph-preview img',
      images: ['an-05.jpg', 'an-01.jpg', 'an-02.jpg', 'an-04.jpg', 'an-06.jpg', 'an-07.jpg', 'an-08.jpg', 'an-09.jpg', 'an-10.jpg', 'an-11.jpg', 'an-12.jpg', 'an-13.jpg', 'an-14.jpg', 'an-15.jpg', 'an-16.jpg', 'an-17.jpg', 'an-18.jpg', 'an-19.jpg', 'an-20.jpg'],
      index: 0
    }
  ];

  projects.forEach(project => {
    const link = document.getElementById(project.linkId);
    const img = document.querySelector(project.imgSelector);
    if (!link || !img) return;

    link.addEventListener('mouseenter', () => {
      project.index = (project.index + 1) % project.images.length;
      img.src = project.images[project.index];
    });
  });
});
