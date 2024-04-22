export default function HighlightText({ text, highlightedPhrases }) {
  // Helper function to determine if a phrase appears in the text
  const shouldHighlight = () => {
    const lowerCaseText = text.toLowerCase();
    return highlightedPhrases.some(phrase => lowerCaseText.includes(phrase.toLowerCase()));
  };

  // If any phrase is found, split the text into parts and highlight only the parts where the phrases are found
  if (shouldHighlight()) {
    const lowerCaseText = text.toLowerCase();
    let lastIndex = 0;
    const highlightedParts = [];

    highlightedPhrases.forEach(phrase => {
      const index = lowerCaseText.indexOf(phrase.toLowerCase());
      if (index !== -1) {
        if (index > lastIndex) {
          highlightedParts.push(text.substring(lastIndex, index));
        }
        highlightedParts.push(<span style={{ color: "red" }}>{text.substring(index, index + phrase.length)}</span>);
        lastIndex = index + phrase.length;
      }
    });

    if (lastIndex < text.length) {
      highlightedParts.push(text.substring(lastIndex));
    }

    return <div>{highlightedParts}</div>;
  } else {
    return <div>{text}</div>;
  }
}

// export default function TextWithRedStyling({ text, highlightedPhrases }) {
//   // Helper function to determine if a word should be highlighted
//   const shouldHighlight = word => {
//     return highlightedPhrases.some(phrase => phrase.toLowerCase().includes(word.toLowerCase()));
//   };

//   // Split the original text into words
//   const words = text.split(/\s+/);

//   // Map over the words and wrap the ones you want to style in <span> with red color
//   const styledText = words.map((word, index) => {
//     if (shouldHighlight(word)) {
//       return (
//         <span key={index} style={{ color: "red" }}>
//           {word} {""}
//         </span>
//       );
//     }
//     return <div key={index}>{word}</div>; // Return the word without styling
//   });

//   return <div>{styledText}</div>;
// }
