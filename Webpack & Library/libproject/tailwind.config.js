module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      zIndex: {
        '-10': '-10',
      },
      colors: {
        marine: '#7beec7',
        primary: {
          100: '#d4d4d8',
          200: '#6a6a77',
        },
      },

      fontFamily: {
        body: ['Poppins'],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
