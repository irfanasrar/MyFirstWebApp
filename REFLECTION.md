Speed of development: Building the navbar, grid, form fields and buttons was much faster than writing that CSS myself. Most of my time went into keeping my own JavaScript working with Bootstrap's markup.

Responsiveness: The old site needed manual layout tweaks to fit a phone. Bootstrap's grid stacks the fields on a narrow screen without extra media queries. I still tested at phone width, because the tip area and a full-width button can feel cramped if you trust the defaults alone.

Usability: The components look consistent, but they also hide some design choices I had made by hand. The awkward parts were overriding a couple of default styles without fighting the framework, and making sure the validation message and the API error were obvious through text, not only a colour change.

Reflection: I would use Bootstrap again for a form-heavy page, but I would keep the fetch and validation logic in my own script so the behaviour stays clear and easy to debug.
