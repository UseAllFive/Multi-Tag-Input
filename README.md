Multi Tag Input
===============
Turns a text area into a tagging mechanism.

It searches a data-set upon keydown, the user can select one to turn into a tag.

When the user focuses on the input, but does not type anything, it can search an additional data-set. This allows for showing suggested results.

There's a title property for the data-set. "Suggest Results", "Recently Tagged", "Your Results".

There's a callback for when a tag is added and removed.

The user can create new tags as well. If they haven't selected a tag from the data-set, they can hit return and it creates a new tag. There's a callback for when a new tag is created.