---
layout: post
title: Practical Object Oriented Design - Book Notes - Chapter 5
categories: [development]
---
This is the fifth part in my review and reading notes on the Practical Object Oriented Programming book (www.poodr.com) by Sandi Metz.

In the last chapter, we learned how _messages_ are at the heart of design, and that messages define the _public interface_ of an object. Combining these two ideas leads to some interesting design consideration, and at the core of this chapter is the concept of **duck typing**.

What _is_ a **Duck Type**? Let's begin with where the name comes from. There's an old saying that says

> If it quacks like a duck and walks like a duck, it's a duck.

What does that mean in the context of programming? Well, consider this:
* Python has no static types, and no type checking in, e.g., method signatures.
* If you have a message to send, you can send it to any object that implements that message, regardless of the class's actual type!

And the point of all this? We replace a dependency on class with a dependency on messages:

Recall our `job_helper` example: The first iteration had class `A` with _explicit_ dependency on _class_ `B`. After using dependency injection, class `A` instead depended on being passed _some_ object that it could send the `process` message to. That job helper object is passed into the `__init__`, and no type checking takes place.

And why is this better? Because it is more _flexible_. There is less coupling, and the code is ready for change.

**Note:** The following code would be very un-pythonic:

```python
class A:
	def __init__(self, job_helper):
		assert isinstance(job_helper, B)
		
	...
```
All of a sudden we're back with having class `A` explicitly depend on class `B`, and making some unreasonable demands: Now the only way to pass a `job_helper` into class `A` is to pass an instance of class `B` into it. If we want to modify some behavior by passing a different class in, that class now needs to _inherit_ from `B`, creating even more coupling.

If you _absolutely_ need to exert this type of control, pick a statically typed language where you don't have to manually add boilerplate type checking code. As the autor writes, users of an object _need not_ and _should not_ be concerned about its class.

Duck typing essentially means: An object is what its interface says it is. Which means a single object can implement many different interfaces, and an application can contain many interfaces that cut across classes.

So let's see what that means

## Overlooking the Duck
In this section, we follow along as the author shows how you quickly end up with messy, coupled, code if you happily code away and _miss_ where there could be a _duck type_ hiding among your objects.

The example is quite instructive, and the code that the author calls ugly is indeed a well-known _code smell_: Having a `switch` statement (or an `if-else-if` block) that checks an object's type and then sends a different message based on that object's type.

If you are overly focused on your existing objects, it is dangerously easy to arrive at such smelly code: You realize that your class `A` might reasonably collaborate with either class `B` or class `C`, but the message you have to send in either case is different, so you do something like
```python
if isinstance(helper, B):
	result = helper.some_message()
elif isinstance(helper, C):
	result = helper.some_other_message()
```
Why is this a code smell? Because it makes your code hard to extend and introduces a strong coupling to type. If you find that yet another class `D` could be a good collaborator, you have to go to each and every of your `if-elif` blocks and add that code, duplicating a lot of knowledge in the process.

Remember, too, that in our list of basic dependencies, we had "knowing the name of a message to send". If every single of our potential collaborators requires a different message to be sent, we end up with _lots_ of these dependencies.

## Finding the Duck
So how do we prevent ending up with messy class-dependent code? It's actually quite straightforwad and rests on a few simple observations:

1. Our smelly code needs the type switching because we need to send a different message to each potential collaborating class based on its underlying type.
2. So if we _could_ somehow send the _same_ message regardless of underlying class, there'd be no need for this messy switching!

But what message to send? A few more observations:

1. Your class should have a single responsibility, and therefore:
2. Its methods should have a single goal in service of that responsibility.
3. Therefore, your class's _collaborators_ arrive at the class (or the method) in service of that goal!

No matter the collaborator's actual underlying class and thus overall responsibility, it arrives at your class or method with a single job: Help fulfill the class's or method's goal!

And there's your duck type. In the authors example, we have a `Trip` that needs to be `prepare`'d. A number of classes arrive to help it do that, including a `Mechanic`, a `TripCoordinator` and a `Driver`. No matter what a Mechanic or a Trip Coordinator or a Driver _generally_ does, they arrive at the `prepare` method with one goal: Help prepare the trip. Therefore, they should all implement a `prepare_trip()` method.

In a statically typed language such as Java, you would now explicitly _declare_ an _interface_ like so
```java
public interface Preparer {
	void prepare_trip(Trip trip);
}
```
and then you would explicitly state that your various classes _implement_ this interface

```java
public class Mechanic implements Prepapre {
	void prepare_trip(Trip trip) {
		// Specific prepare stuff for Mechanic
	}
}
```
and the trip class's prepare method would explicitly ask for a list of preparers:
```java
public class Trip {
	void prepare(List<Preparer> preparers) {
		// Iterate over preparers and call their prepare_trip method
	}
}
```

In a dynamically typed language, however, there is no need to explicitly create and define these interfaces. But just because you did not explicitly write down that there's such a thing as a `Preparer` does not mean such a type is not hiding in your application. 

At this point you might object: What if the different preparers need to _know_ different things about the trip? In the pre-duck-type'd version, we'd have `prepare_bicycle(bike)` and maybe 
`fill_up_vehicle(vehicle)` and `buy_food(customer)`. Now we want to just send `prepare_trip` each time.

The message sequence diagrams in the book show the answer: To prepare a trip, we send the `prepare_trip` message to our preparers, and the various implementations of `prepare` then send messages (queries, to be specific) back to the trip object: The mechanic asks for the bikes, the trip coordinator asks for the customers, and so on. This requires of course that `Trip` has a reasonable public interface that grants access to whatever the other collaborators need to know, and one should take care to follow all the good rules of interface design as discussed in the previous chapter.

## Consequences of Duck Typing
Let's quote Sandi directly with this great bit:

> The ability to tolerate ambiguity about the class of an object is the hallmark of a confident designer. Once you begin to treat your objects as if they are defined by their behavior rather than by their class, you enter into a new realm of expressive flexible design.

As you rework your design, removing dependencies on _concrete_ classes and instead introducing duck types, you move from the concrete to the abstract. This might _initially_ be harder to understand, but such code is _much_ easier to change and extend.

The one drawback, so far, of introducing the duck type is that it is so ephemeral. When you rely on concrete classes, you can go to the implementation of the concrete class and see what it does. But in the example of the `Preparer`, there is no definite place you can go to see what `Preparer.prepare_trip` does. More on that later in this post (and in the book, of course.)

### Quick Side Note: Python's Magic Methods
To see great use of duck typing in action, consider the way Python let's you control how _your_ objects should be... printed, copied, iterated over etc:

Any class that implements `__len__` and `__getitem__()` for integer indices is considered by Python to be a _Sequence_. No need to explicitly declare that your class implements some `Sequence` interface. And any piece of code that expects an object over which it can iterate, or whose elements it can access via an index, will work seemlessly with your class.

# Writing Code that Relis on Ducks
The implementation of a duck type itself is pretty easy. The hard part is in recognizing where and when you should be using one. So now the author discusses a few common patterns to look out for.

## Recognizing Hidden Ducks
Here the author again emphasizes that _switching_ on class type is a bad code smell. Say you have a variable that could be one of several different types. As mentioned above, you need to then take a step back and ask: Why do I have this variable here in the first place? It arrived at your class, at your method, for a specific purpose, and _that_ purpose informs the message you _should_ be sending.

This warning against switching on type also extends to switching on implemented methods: Imagine some horribly inconsistent API where you want to turn an object into a string and have to check individually whether your object implements `to_string` or `toString` or `convert_to_string` and then call that. An obvious eample of a missed duck type!

## Placing Trust in Your Ducks
> Flexible applications are built on objects that operate on trust; it is your job to make your objects trustworthy.

Use the code smells mentioned above to find the missing duck: What does the offending code _really_ want? Then define a duck type that does just that. Implement it in the relevant classes and enjoy the clean interface!

What follows in the book are a few rather short sections discussing a few more fine points. Maybe it's enough to briefly summarize them:

* Because a duck type does not concrentely exist in the form of an explicitly defined interface, it is important to document and test their interface appropriately. More on that in Chapter 9.
* Sometimes, duck types need to share behavior instead of just their interfaces. This is discussed in Chapter 7.

### Quick Side Note: None Type
As an example of a type check that _is_ okay, the author gives the example where some object could be either of a certain class type, or it could be `None` (`NilClass` in the Ruby example). If that other type is a basic type, then we're in a situation where the classes we now depend on (say, `NoneType` and `list`) are much more stable than our own class. It is then okay to depend on it.

I would like to add a thought here, though: If your code is littered with checks for something being `None`, it might be better to use a design pattern called _Null Object_, that is, having an explicit class that represents some other class not being there:

```python
if this_object is None:
	do_the_thing_where_it_is_none()
else:
	this_object.do_something_fun()
```
could be transformed to:
```python
this_object.do_something_fun()
```
as long as we have 
```python
class FunObjectNullType:
	def do_something_fun():
		# Actually do the thing where it's None
```
That way, the responsibility of checking for `None` everywhere is removed from the client code and instead moved to a specific place: This class then has a clear, single, responsibility: Deal with some sort of default behavior.

## Conquering Fear of Duck Typing
A great chapter! The message ultimately boils down to: If you are writing in a dynamically typed language (Ruby, Python, ...) and try to _force_ it to behave like a statically typed language (Java, C#, ...) you get the _worst_ of both worlds.

This section isn't meant to be a discussion of which sort of typing is _better_. The answer to that will very much depend on your particular situation and preferences. Both approaches undeniably have their benefits and their trade-offs.

Think about it like this: For a particular home improvement project, you might be best off using nails. For another project, screws will be better. For some, it will be purely a matter of taste. But no matter which you choose, once you have made the choice you better use the right tool associated. Don't pick screws for your project and then bash them in with a hammer.

### Subverting Duck Types with Static Typing
Just as a recap: In static typic, each and every variable, method argument, and method return value have a single type, and you must explicitly declare what that type is: "This variable shall be a string, and this variable shall be a floating point number and this method returns an instance of `SomeClass`". With dynamic typing, you _don't_ do any of that.

Quick side note: Python has recently introduced type _hints_. It might _look_ like static typing on the surface, but it is not. These hints are purely meant as a bit of documentation and as means for your IDE to show useful parameter hints. The python runtime itself will not care one bit whether you pass a floating point number into a method whose argument had a `str` type hint.

Some people are so uncomfortable with dynamic typing that they hack static typing into the language. Their code is littered with `isinstance` checks, but doing so subverts the power of dynamic typing. You cannot write beautifully flexible code with duck typing if your code fails when "the wrong type" arrives.

Another Python side note: With Python's Abstract Base Class module, you can define an _abstract_ class that merely specifies the interface of your duck type. You can then implement the `__subclasshook__` class-method where _you_ get to control how a type check against your abstract base class is performed. For a duck type, this would just be about checking whether certain methods are implemented. This technique has indeed the potential to give you the best of both worlds: Duck typing because your concrete classes don't need to inherit from any particular base class, and type checking in a place where you think you _absolutely_ need it. That being said, strongly consider whether you _really_ need to put type checks into your code.

### Static versus Dynamic Typing
Here we get a fair comparison of the benefits of either static or dynamic typing. Note though that these benefits depend on certain assumptions. I don't think I need to recite this section here. It's pretty straightforward.

### Embracing Duck Typing
A great discussion: Some of the perceived "dangers" of dynamic typing are not actually a big deal. One oft-cited benefit of static typing is that the _compiler_ will catch (some, but certainly not all. Or why else would Java need a `NullPointerException`?) type errors at compile time, which is better than your program suddenly crashing at run time.

Technically this is true, but according to the author, this great big boogeyman of runtime type errors is greatly exaggerated. Yes, a dynamically typed language puts the burden on you to pass in objects that respond to the message they're being sent. But if your program is designed well, using trustworthy and expressive code, such type errors should be exceedingly rare. If that is the case, static typing may very well be the equivalent to Springfield's Bear Patrol: https://www.youtube.com/watch?v=fm2W0sq9ddU

# Summary
Judge objects by what they do, not by who they are!
