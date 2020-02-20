---
published: true
title: The Law of Demeter - Don't let your classes micromanage each other
layout: post
categories: development
---
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

This might sound overly strict, but I agree in large part with JavaDevGuy in his post [The Genius of the law of Demeter](https://javadevguy.wordpress.com/2017/05/14/the-genius-of-the-law-of-demeter/): It is _the_ law of object oriented programming.

### Why is this bad, anyway?

When violating the LoD, you are sprinkling unrelated structural knowledge throught your code. Each part of the trainwreck is a piece of knowledge that you assume you have: "In this code, cars have owners, which have addresses, which have postal codes, and they are accessed through these particular methods." Your trainwreck introduces coupling where it might not be wise to do so. This makes your application hard to change and, ultimately, leads to the famed and feared Spaghetti code.

### Some caveats and nuances

Of course, nothing is ever quite as black and white, so let's unpack a few important points about the law.

First, you can technically get around the law by introducing wrapper methods: You could add a method `getOwnerAddressesPostalCode()` to the car object. But in a sense you're still violating the law. Maybe not its text, but definitely its spirit: You are still coupling a postal code to a car where it might be ill-advised.

Second, contrary what you sometimes read on articles on the subject, the LoD is not [a dot-counting exercise](https://haacked.com/archive/2009/07/14/law-of-demeter-dot-counting.aspx/). This cuts both ways: On the one hand, just because you don't have multiple dots per line doesn't mean you don't violate the law (see above's lengthy wrapper method). On the other hand, just because you _do_ have multiple dots per line doesn't mean you _are_ violating it. For starters, a method you call might be returning an object that, in turn, is on the list of allowed objects. This is an important feature of so-called _fluent_ interfaces. But even if an object doesn't strictly fall on above's list of allowed objects, it might still make sense to call methods on it: If that object is a _friend_ of yours.

A clarification, relaxation and expansion of the Law of Demeter states that you can call the methods of any object you are _friends_ with. The objects in the original list above are all friends, but it doesn't stop there. Other examples of friendly classes are given in candied_orange's excellent [post](https://softwareengineering.stackexchange.com/a/322645/161522) on the topic:

- Value objects are friendly with everyone. Especially if they are part of the domain you are writing for. Imagine trying to write code for a physics simulator where the Law of Demeter would prohibit you something like `wavefunction.amplitude.real`. In scientific programming, a lot of the objects that you deal with will be value objects.
- Collections should be friendly with everyone who uses them: If your class holds a list, then clearly it should be able to call a method on the list to get to one of the list's items, and then call a method on these items.

## Tell, Don't Ask

When faced with a situation where you feel you _must_ violate the Law of Demeter, there's a good chance the overall design is flawed. Sometimes, the violation can be resolvd in syntactic means:

Imagine you have a method

```python
def f(self, b):
    b.get_a().do_something()
```

then you could instead add a method to `b` that reads `b.tell_a_to_do_something()`. Of course that might just be violating the law in spirit anyway, but sometimes it's perfectly appropriate to go this route of delegation.

Alternatively, if method `f` needs object `A` to get its job done, it should ask for it as a parameter:

```python
def f(self, b, a):
    a.do_something()
```

And finally, a larger redesign of which objects exist and how they talk to each other might be in order. The guiding principle here goes back to the beginning of the post: Don't micromanage. What is it you want to accomplish? Whose responsibility is that? Tell them, but leave the execution details up to them!

Another great StackOverflow [post](https://softwareengineering.stackexchange.com/a/284146/161522) by user candied_orange talks about the SOLID design principles. In particularly the "Single Responsibility Principle" and the "Dependency Invesion Principle" (more on these later, maybe?) take you in great strides towards code that automatically won't violate the Law of Demeter.

# Conclusion

At the very least, I hope to have convinced you that a long chain of method calls is a _code smell_ that warrants further investigation: Are we micromanaging here, or legitimatly using domain value objects? And could we improve our design, make it more adjustable and modular, in an attempt to remove the violation? A better design might very well result from that!