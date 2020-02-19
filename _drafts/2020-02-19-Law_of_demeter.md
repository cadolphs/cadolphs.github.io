---
published: false
---
## Don't let your classes micromanage each other

Anyone who has ever worked with a micromanaging boss or supervisor knows how demoralizing and inefficient this can be. Instead of being asked to achieve results as they are defined in your role's responsibilities, such a boss tells you in excrutiating detail what steps you should follow.

Nobody likes a micromanager, and the classes you write in an object oriented language are no different there! They are much happier if you tell them what to do, in terms of their responsibilities, rather than asking them for a detailed report of their internal state and then going off on a long chain of commands.

This idea is not new, of course, and relates to two important, interlinked concepts: The Law of Demeter, and the "Tell, Don't Ask!" principle. Let's start with a brief introduction and summary of them and then expand on what it means for our code.

## The Law of Demeter

This law (sometimes snarkily referred to as the "sometimes helpful suggestion" instead) states, at a high level, that your class should not talk to strangers. How does that look like? Suppose you have class, `C`. That class has a method, `f`. Inside of `f` is a bunch of code. You might, for example, want to call some other methods from within `f`. The Law of Demeter says that you are only allowed to call methods of the following objects:

- `C` itself
- Objects passed to `f` as arguments
- Any objects that were created or instantiated by `f`
- Component objects (i.e., held in instance variables) of `C`

Anything else is considered off limits! In particular, if one of the methods that are permitted returns an object that's not in turn part of the permitted list, you cannot call any of its methods! Egregious violation of this law are referred to as _train wrecks_, and you can recognize them by a lot of dots: `car.get_owner().get_address().get_postcal_code()`. Yuck! You are micromanaging the application by asking the car to tell you who its owner is, which you then ask where they live, and the address then is supposed to hand you its postal code.

### Why is this bad, anyway?

When violating the LoD, you are sprinkling unrelated structural knowledge throught your code. Each part of the trainwreck is a piece of knowledge that you assume you have: "In this code, cars have owners, which have addresses, which have postal codes, and they are accessed through these particular methods." Your trainwreck introduces coupling where it might not be wise to do so. 

## Some caveats and nuances

Of course, nothing is ever quite as black and white, so let's unpack a few important points about the law.

First, you can technically get around the law by introducing wrapper methods: You could add a method `getOwnerAddressesPostalCode()` to the car object. But in a sense you're still violating the law. Maybe not its text, but definitely its spirit: You are still coupling a postal code to a car where it might be ill-advised.

Second, contrary what you sometimes read on articles on the subject, the LoD is not [a dot-counting exercise](https://haacked.com/archive/2009/07/14/law-of-demeter-dot-counting.aspx/). This cuts both ways: On the one hand, just because you don't have multiple dots per line doesn't mean you don't violate the law (see above's lengthy wrapper method). On the other hand, just because you _do_ have multiple dots per line doesn't mean you _are_ violating it. For starters, a method you call might be returning an object that, in turn, is on the list of allowed objects. This is an important feature of so-called _fluent_ interfaces.