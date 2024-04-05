---
title: Practical Object Oriented Design - Book Notes - Chapter 6
date: 2020-12-27
---
This is the sixth part in my review and reading notes on the Practical Object Oriented Programming book (www.poodr.com) by Sandi Metz.

So, let's talk inheritance. It might seem strange that, in a book about object oriented design, inheritance only shows up this late in the game. Isn't inheritance _the_ OG object oriented feature? Well, let's see!

Some recap thoughts:
* In a well-designed application, code is easy to reuse, and is also actively being reused to solve different problems.
* If your classes are small, have minimum context, have their dependencies injected into them, and furthermore have clear public interfaces, then they're already super reusable!
* So where does that leve inheritance?

I appreciate the authors goal: There's a _know how_ to using inheritance, and there's also the (even more important) question of _whether_ to use it at all.

# Understanding Classical Inheritance
Without getting philosophical about inheritance and taxonomies and "is-a" relationships, at its practical core inheritance is about message delegation: If an object receives a message, it either deals with the message itself, or it delegates the message to another object. All inheritance does is say: _Any_ message you don't understand yourself, please delegate to the class you're inheriting from.

But leaving it at this level is dangerous. There are certainly _misuses_ of inheritance that create unnecessary coupling and rigid structures that make your code hard to maintain and extend! 

# Recognize Where To Use Inheritance
So here the author gives a good example where inheritance will be useful; but also discusses _how_ we go about recognizing this in general, and how we then go about _introducing_ inheritance. One main takeaway right away: It's pretty much _never_ a good idea to _start_ with some preconceived idea of what the inheritance structure (the family tree, so to speak) of your classes _should_ look like. Let the concrete objects you have be your guide!

## Starting with a Concrete Class
Here the author just introduces a concrete class that does a concrete thing. A bicycle, in this case, that has some info about its tires and about what sort of spare parts it needs.

## Embedding Multiple Types
In this chapter, we introcuce some extra behavior, some twist, in our concrete class: We want to add something that is _almost_ like the thing we already have. This happens _all_ the time! It is at this point very tempting to just bolt that extra stuff onto the class we already have. (Here it is again, that strong focus on classes that are already there!)

Often, this sort of bolting-on involves adding a switch to our class. In this case, the `Bicycle` class gets a field that says whether a particular instance is a road bike or a mountain bike. And then the class's methods involve checking what that type field is set to.

This is bad! It is just like the antipattern (code smell) from the previous section. Just as we shouldn't switch on an object's class so we shouldn't switch on a class's "type" or "style" variable: It leads to rigid code that's awkward to extend, and it also leads to lots of duplications as our class will be littered with these type checks.

In more direct terms, adding such a type or style field violates the single responsibility principle, because with that switch we literally state that our class does either one thing or another thing.

## Finding the Embedded Types
Such a type check is really a strong hint that we should be dealing with two different classes. It may very well be the case that these classes share lots of behavior, but they also differ across some aspects, as expressed by that `style` variable. This is exactly the situation where inheritance _can_ be useful.

## Choosing inheritance
The automated delegation that happens with inheritance means that a subclass is everything the superclass is _and then some_. The subclass _acquires_ the complete public interface of its superclass. This brings with it certain _responsibilities_: The superclass's public interface represents a certain contract; certain promises about what the public interface achieves. Your subclass must honor this contract!

## Misapplying Inheritance
Before we see how _good_ inheritance looks like, the author shows us how _bad_ inheritance looks like. The hidden culprit here is, again, an overreliance on existing classes:

The example had a concrete class `Bicycle` and then has `MountainBike` inherit directly from this concrete class. That led to a number of issues, becase the original bicycle class has behavior that _doesn't make sense_ for a mountain bike (things like handlebar tape, apparently). There's a code smell with the name _Refused Bequest_: 

> Sub-classes get to inherit the methods and data of their parents. But, what if they don't want or need what they are given? They are given all these great gifts and pick just a few to play with. 
> -- Martin Fowler, Refactoring: Improving the Design of Existing Code

Inheritance is all-or-nothing. By adding methods to your class's public interface, you _promise_ that your class will _behave as expected_ when someone calls these methods!

As we will see below, writing classes that are "open for extension" (via inheritance) requires special care and techniques to reduce the risk of ending up with a strongly coupled mess.

## Finding the Abstraction
Given that subclasses are _specializations_ of their superclasses, any object that expects to be working with an instance of the superclass should be able to work instead with an instance of the subclass _without knowing that it is dealing with a subclass_. This is the Liskov substitution principle, named after Barbara Liskov. 

### The Two Main Rules of Inheritance
Inheritance can only work if these two things are true:
* If `Child` inherits from `Parent`, then `Child` _really_ must be a _specialization_ of `Parent`.
* You must use the correct coding techqniues. More on that later.

In terms of specializations, here is a quick example of this principle gone wrong: If you see your inheritance tree as a sort of taxonomy where the child classes have an "is-a" relationship with the parent classes, you risk violating the "specialization" principle. For example, a `Square` _is a_ `Rectangle` but code that expects a `Rectangle` to work with might _not_ work with a `Square`, because a square is a _restricted_ rather than an _extended_ version of a rectangle.

## Creating an Abstract Superclass
So far we discussed why it is dangerous to just directly inherit from a concrete class. It is better to first find what the two concrete classes would have in common and extract that into a superclass. This class may very well be _abstract_. Such abstract classes _exist_ to be subclassed.

Also, if you remember the discussion from chapter 3, it is always better if classes that have many dependencies are more on the abstract side, as abstract qualities are less likely to change than concrete qualities. 

One note for those of us who are over-eager: Resist the temptation to _start_ your coding with a big class hierarchy design up front. You almost never get it right. And in particular, don't create an abstract class if there would currently be only one concrete subclass. That would be premature, because you haven't yet seen on which dimension the other concrete classes would differ, and on which dimensions they would share behavior! It is much better to wait until more information arrives.

And the author says that even with _two_ examples of concrete classes that _could_ quite reasonably put some shared behavior into a common superclass, it might be premature to do so! Often best to wait for _three_ examples. I've heard a similar "three strikes" rule for other occasions where you would want to remove duplication. There's a tension here between improving the design _right now_ but risking getting it wrong versus living with a worse design _for now_ but then having a better design once more information arrives. Check out the relevant chapter!

## Promoting Abstract Behavior
Okay, so now for the sake of example we _do_ create an abstract class for `Bicycle` with the idea that `RoadBike` and `MountainBike` will be subclcasses. We could go about this _refactoring_ in two ways:
1. We could add an empty class `RoadBike` that inherits from `Bicycle`. Then we _push down_ the concrete stuff from `Bicycle` into `RoadBike` and leave only the abstract stuff behind.
2. Or we could rename `Bicycle` to `RoadBike` and add an empty abstract class `Bicycle` from which `RoadBike` inherits. Then we _push up_ all the general abstract stuff from the concrete class to the abstract class.

Both sound innocent enough, but the author beautifully explains why one way leads to disaster! It boils down to the question "Well, what if you're wrong?". If you pick option 2 and _push up_ the abstract code, you might _miss_ some of the abstract code. If some abstract behavior is missing in the base class, it will need to be _duplicated_ in all the subclasses, and this duplication will be easy to spot and remedy. 

If, on the other hand, you pick option 1 and _push down_ the concrete code, and you miss some of the concrete stuff, then your supposedly general, abstract, class is now _polluted_ with concrete behavior. Other subclasses might start to depend on it, or they might have to "deal" with it much in the way that `MountainBike`, in the "bad" version, had to deal with concrete road bike behavior that it didn't need or want!

## Separating Abstract from Concrete
Just a quick note here: Sometimes you can directly push a method up in the hierarchy, 
but as the author explains with an example, sometimes you first have to pry apart the abstract and the concrete. Another argument for keeping your methods short and single-purpose! The top-level methods might be more on the abstract side and the lower-level methods called by them might be more on the concrete side. That allows for easy promotion up the class hierarchy. If you had just smashed everything into a single method, you might miss this opportunity!

## Using the Template Method Pattern
Another benefit of using small methods with single purpose is that your subclasses can override them, with great precision, to provide specialized behavior.

# Managing Coupling Between Superclasses and Subclasses
Now it gets interesting and this often gets overlooked when using inheritance!

* Inheritance introduces coupling!
* This coupling must be carefully managed, just like any other coupling!
* Ideally this coupling will not be overly tight!

## Understanding Coupling
Here's a special coupling that is unique to inheritance: If you've used inheritance, you have certainly come across this situation: A subclass overrides a method of the superclass but still relies on the superclass's implementation of that method, and it gets there via a call to 
`super`. Here is an example:

```python
class Superclass:
	def __init__(self, *init_args):
		self.do_superclass_init_stuff(*init_args)

class Subclass(Superclass):
	def __init__(self, *init_args):
		self.do_some_special_subclass_init_stuff(*init_args)
		super().__init__()
```
Looks innocent enough, but it might also show up in more complicated methods! The problem here is that we introduce a certain coupling: We need to know _when_ and _how_ and _if_ to call the various methods of `super` in order to provide our specializations! Our subclass, when sending messages to `super`, basically says: "I know the _algorithm_". But that knowledge belongs in the superclass!

## Decoupling Subclasses Using Hook Methods
If the superclass controls the algorithm, it must allow the subclasses to provide specialized behavior in certain predefined places. This is achieved via hook methods. In the example above, we would rewrite it like so:

```python
class Superclass:
	def __init__(self, *init_args):
		self.do_superclass_init_stuff(*init_args)
		self.post_init(*init_args)

	def post_init(self, *init_args):
		pass
	
class Subclass(Superclass):
	def post_init(self, *init_args):
		self.do_some_special_subclass_init_stuff(*init_args)
```
Here, `post_init` is a _hook method_. The superclass decides when in the init process it gets called, and it provides a default implementation that does nothing. The subclass overrides it to provide its specialization.

This approach is also called the _template method pattern_. The superclass's
responsibility is to know the abstract concept of what needs to happen, i.e.,
what methods need to be called. The subclasses are responsible for filling in
the blanks, without having to know exactly where in the algorithm these blanks
are.

# Summary
Main takeaways: Inheritance works best if there is some _stable abstraction_
where you have at least _three_ concrete examples (to really nail down what the
common abstraction should be). Using the template method pattern and hook
methods means that your subclasses can fully focus on providing their
specializations without having to know the abstract algorithm of your
superclass.
