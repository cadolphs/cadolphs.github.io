---
layout: post
title: Practical Object Oriented Design - Book Notes - Chapter 2
categories: [development]
---

This is the third post in my book review / book notes series about "Practical Object Oriented Design" by Sandi Metz. (https://www.poodr.com/)

The previous chapter was focused on a single class, and how each class should have one single responsibility. If you design your classes in this way, then obviously any complex behavior must be the result of classes _collaborating_. This need for collaboration introduces _dependencies_ between the classes, and the job of good design is to manage these dependencies in the best possible way.

Basically, if you ask a class to do something, there's three ways this can happen:
1. The expected behavior is implemented by the class itself. (See last chapter)
2. The class _inherits_ the behavior from another class. (Discussed in a subsequent chapter)
3. The class _delegates_ the behavior to another class. This is what we talk about in this chapter

# Understanding Dependencies
As mentioned, collaboration introduces dependencies. We say that A depends on B if A might have to change when B changes. Consider this abstract example:

```python
class A:
	def do_your_job(self, arg1, arg2):
		job_helper = B()
		some_intermediate_result = job_helper.process(arg1, arg2)
		return self.more_processing(some_intermediate_result)
```

Let us list all the ways in which class A depends on class B. Class A __knows__
* The name of the class B, and how to create a new instance of it.
* The name of the method it needs to call (i.e. the name of the message to send to class B).
* The arguments required by that message.
* The order of those arguments.

Some of these dependencies are inevitable. But many are not! And you'd be surprised!

Good Design: Manage dependencies so that each class has fewest possible. _Just_ enough to do its job and nothing more.

## Coupling Between Objects (CBO)
A dependency between classes A and B _couples_ them to each other. The more tightly coupled, the more it's basically one entity. That limits reuse, and makes change harder, because now it's spread over more than just one class. In the example above, we cannot reuse `A` without also bringing `B` along for the ride.

Sometimes, this is not a big deal. For example, a given class might bring along with it a number of custom-defined exception classes, like `CouldNotDoMyJobException`. 

More often than not though, strong coupling is _not_ inevitable. Below we will see some examples and techniques for addressing this.

## Other Dependencies
A quick aside that other chapters will deal with certain other types of dependencies. Just a quick overview:

* Law of Demeter: Imagine if one object knows another who knows another who knows something. This dependency on a complete _chain_ of objects knowing each other is fragile and best avoided.
* Test-to-code coupling! Another type of dependency. Learn about writing good, cost-effective tests that aren't fragile! (Chapter 9)

# Writing Loosely Coupled Code
Back to the four original examples of couplings. 

The author describes dependencies as _little dots of glue_ where the various classes neatly fit together. But if you have too much glue, everything devolves into one big lumpy mess.

We'll look now into specific techniques that address the four dependencies we mentioned above.

## Inject Dependencies
So in our toy exmaple, class A knows the name of class B. That is a dependency. If we change the name of class B, we have to update it in class A.

Now what's the big deal with that? There's simple search-and-replace functionality, and there's modern IDEs with refactoring support. So really the mere name itself isn't the problem here.

The real problem is that we are hard-coding the creation of instances of class B. Class A has some responsibility (`do_your_job`) that it cannot completely fulfill on its own. It needs to collaborate with another class, and in the current code version, it decides to _only_ collaborate with instances of class B. The author calls this an _unjustified attachment to type_. Ultimately, we don't care about the name of the class, or even its exact type. We care about sending it the `process(arg1, arg2)` message!

The simplest way to deal with this problem has the fancy name of _dependency injection_:

```python
class A:
	def __init__(self, job_helper):
		self.job_helper = job_helper
		
	def do_your_job(self, arg1, arg2):
		some_intermediate_result = self.job_helper.process(arg1, arg2)
		return self.more_processing(some_intermediate_result)
```
Here we decide that it's not the job of class A to know how to _make_ a `job_helper`. It needs one to collaborate with, so we pass it in. The example above _injects_ the `job_helper` dependency in the class's `__init__`, but we could also consider passing it in at the method level, as in `do_your_job(self, arg1, arg2, job_helper)`.

Of course _somewhere_ in our program we will have to create an instance of a class that responds to the `process` message, which might very well be an instance of class B. But we have decided that knowing what class to instantiate, and how, is not the job of class A.

Writing your code this way also makes it easier to write unit tests for your code! In the previous version, testing class A without also testing class B would be a bit tricky. At least in Python we can use "monkey patching" to mock out class B. But it is much cleaner and easier if we can just pass in either a mock or a dummy version of a `job_helper` directly. More on testing will come in a later chapter.

Maybe at this point I will mention one additional technique, or pattern: Sometimes it is not enough to inject an instance of a class to collaborate with. Imagine our class A needed to be able to create new instances of the `job_helper`. How can it possibly do that without knowing the name of the class it needs to create? The answer is: Through a _factory_. Instead of passing in a `job_helper` into the `__init__`, we would pass in a `job_helper_factory`. Then, whenever class A would need to get its hands on a new instance of a job helper, it could call something like `job_helper_factory.make_new_job_helper()`. The knowledge of what concrete class to instantiate is completely contained within that factory class.

To recap: Realize that creating instances of a class can be seen as a _responsibility_ that may or may not belong into your class. If it doesn't, use dependency injection to provide your class with its dependencies.

## Isolate Dependencies
Here the author briefly addresses what you could do if you don't have full control over the codebase _or_ just not enough time to complete get rid of all the unnecessary dependencies right now.

If that's the case, you should at least _isolate_ them:

### Isolate Instance Creation
In our `class A` example above, let's say we cannot move creation of class `B` to some outside part. Then at lest we should _isolate_ this creation, maybe like so:

```python
class A:
	def get_new_job_helper(self):
		return B()

	def do_your_job(self, arg1, arg2):
		job_helper = self.get_new_job_helper()
		some_intermediate_result = job_helper.process(arg1, arg2)
		return self.more_processing(some_intermediate_result)
```
Assuming that in a more complex example, creations of `B` might be sprinkled all throughout class A's methods, moving that creation to exactly one method isolates this dependency and makes it explicit: Reading the code of class A, we immediately see that it explicitly depends on class B. The dependency is not hidden deep in the belly of some method. This helps us maintain the code, and also is a great reminder to us to consider refactoring the code further, to get rid of that dependency.

### Isolate Vulnerable External Messages
Imagine in our simple example that `job_helper.process` was called in a lot of places, or called deep inside an internal method. _If_, in the current phase of our design and coding process, we reasonably expect that this `process` message might change, it is a good idea to _isolate_ this message in a separate method:

```python
class A:
	def get_new_job_helper(self):
		return B()
	
	def process(self, arg1, arg2):
		return self.get_new_job_helper().process(arg1, arg2)
	
	def do_your_job(self, arg1, arg2):
		some_intermediate_result = self.process(arg1, arg2)
		return self.more_processing(some_intermediate_result)
```

If that whole job-helper and process code happened in multiple places of our code, extracting it into its own method is a good idea anyway, due to the "Don't Repeat Yourself" principle. But even if it only happens in exactly one place, it might still be a good idea to extract it, to move the interesting bits out from the depths of an internal method, so that the dependency becomes explicit and obvious.

## Remove Argument-Order Dependencies
Briefly, knowing in which _order_ to pass in arguments is _also_ a dependency, and one that can make it hard to later change a method's signature by adding new arguments. Especially early on in design, your methods' signatures will probably change a lot, so it makes sense to try and not depend on this order.

Luckily, this is very eason in Python by using keyword arguments. You don't even have to change how to define the method itself, just how you call it.

When using keyword arguments, you trade one dependency on another: Instead of depending on the order of arguments, you now depend on the _names_ of the arguments. So we don't really reduce the number of dependencies when using keyword arguments. Is it still worth it? Yes! Not all dependencies are equal. Some are better than others. Argument _names_ are more _stable_ and more _explicit_ than argument order. If you have to depend on _something_, try to depend on something that's less likely to change and try to depend on it in a way that's explicit.

### kwargs in Python
One extra thought, a short excursion, at this point: Python allows a method to accept _any_ keyword argument via the `**kwargs` syntax: `def function(an_argument, **kwargs)` will store any keyword arguments 
passed when calling `function` in the dictionary `kwargs`. 

I admit that I am _not_ a big fan of this, because it _obscures_ what arguments we are expecting. A caller would have to read the docstring (which might be out of date!) or, worse, dive into the body of the function to discern which keyword arguments there are.

Often you see this construct when one function takes a few keywords out of the dict (via `pop`) and then passes the rest along to another function it calls. Almost always when I see this, there is a violation of the Single Responsibility Principle, or a mis-managed dependency. I believe that in the majority of cases, a better design can eliminate the need for using the catch-all `**kwargs`.

One common use-case (and anti-pattern, really) for kwargs occurs in mismatched class hierarchies. We talk about inheritance later, but assuming that you are familiar with the basic concept, you sometimes see a class hierarchy where the various child classes, inheriting from the same base class, want slightly different signatures for their methods:

```python
class Base:
	def some_function(self, arg):
		pass

class ChildA(Base):
	def some_function(self, arg, **kwargs):
		...
		
class ChildB(Base):
	def some_function(self, arg, **kwargs):
		...
		
```

The justification here for using `kwargs` is that, at least syntactically, you can call `some_function` for each of these three classes with the same arguments. The problem is that, if you really require different signatures for the various classes, they shouldn't be related via inheritance in the first place! The whole idea behind inheritance and polymorphism is that someone sending the `some_function` method does not, and _should not_, need to know whether the recipient is `Base`, `ChildA`, or `ChildB`. Code like the one above _begs_ for the anti-pattern of the type switch:

```python
if isinstance(someclass, ChildA):
	someclass.some_function(arg, special_argument_for_child_a="foo")
elif isinstance(someclass, ChildB):
	someclass.some_function(arg, special_argument_for_child_b=42)
```

Seriously reconsider your design at this point. Evaluate whether inheritance is what you want, and explore how you could rearrange the code such that the signatures of inherited methods remain the same.

# Managing Dependency Direction
In a lot of cases, and certainly in the example above, the dependency has a specific direction: Class A had a dependency on class B, but class B did _not_ have a dependency on class A. It is however often possible to rearrange your code and your general logic in such a way that, instead, B would depend on A.

Let's recall the old version of the toy example a bit:

```python
class A:
  def do_your_job(self, arg1, arg2):
	job_helper = B()
	some_intermediate_result = job_helper.process(arg1, arg2)
	return self.more_processing(some_intermediate_result)

class B:
	def process(self, arg1, arg2):
		return self._some_internal_calculations(arg1, arg2)
```

If we decide to remove the responsibility of "doing the job" from class A to class B, we could have a result like this:

```python
class A:
	def help_with_job(self, intermediate_result):
		return self.more_processing(intermediate_result)

class B:
	def do_your_job(self, arg1, arg2):
		some_intermediate_result = self.process(arg1, arg2)
		helper = A()
		return A.help_with_job(some_intermediate_result)
```
In this example, class B has a dependency on class A, and A does not depend on B anymore.

Note that now of course we'd look into whether or not we should _inject_ the instance of class A instead of creating it right here inside of class B, but that is not the focus of this section.

Rather, the _ability_ to change the direction of dependencies raises the question: Which direction is the right one? Does it matter?

### Choosing Dependency Direction
The author says it best: You should depend on things that change less often than you do!

This sounds simple, but it can have a profound impact on how you think about your code.

Here, the author lists "three simple truths about code"

* Some classes more likely to change than others
* Concrete classes are more likely to change than abstract ones
* Changing a class that has many dependents will result in widespread consequences

The first point should be self-evident. The classes at the edge of our current development will change a lot. Classes at the core of a standard library will change rarely. In between is a wide spectrum. The well-understood core of our own application might be relatively stable but still change more often than the standard library.

The second point might be more subtle. An abstract class is one that either only defines an interface without implementing it, or a class that fulfills a more abstract responsibility. Maybe it is a class that, concretely, facilitates messages between other, more concrete classes. 

The third point should be clear as well: All else being equal, changing a class on which a lot of other classes depends will always be messier than changing a class on which few other classes depend.


### Recognizing Concretions and Abstractions
In this section we get a nice discussion of "concrete" versus "abstract". We have already used this concept: When we used dependency injection in our very first example in this chapter, we removed the dependency on something _concrete_ (class B and how to create it) to something 
more _abstract_: The idea that there's certain objects, whatever they are and wherever they come from, that you can send the `process` message.

In languages with strict typing (Java, C++/C#), we would have to explicitly define an 
_interface_: An abstract class that expresses the abstract concept of understanding the `process` message:

```java
public interface IJobHelper {
	public SomeReturnType process(SomeType arg1, SomeOtherType arg2);
}
```
and then make it clear that our class A now expects a `job_helper` passed into its constructor, with the type `IJobHelper`.

In Python (and other dynamically typed languages such as Ruby) we do not have to explicitly declare an interface. Any object that happens to respond to the `process` message can be used. This is also called _Duck typing_, after the phrase "If it walks like a duck and quacks like a duck, it's a duck!"

Either way, depending on abstractions is more _stable_ than depending on concretions, simply because a concretion is an "abstraction with the details filled in".
* E.g. depending on "I'm being passed an object that understand this method" is more abstract than creating concrete instance and sending arguments in concrete order...
* This is where interfaces come in, either explicit (strictly-typed languages) or implicit (Duck-typing)

### Avoiding Dependent-Laden Classes
Here, the author adds an important subtle point to the way we should think about classes with many dependents: It's obvious that, if you change a dependent-laden class, you'll get lots of ripple effects that might require related changes. 
But what that means, in practice, is that even _having_ a dependent-laden class in the first place is bad, because you will be _very_ reluctant to touch it.

### Finding the Dependencies that Matter
This is a really cool section that drives home all the points made above.

Consider all your code, all your classes, and put them in a scatter plot. The x-axis 
represents how many dependents it has. The y-axis represents how likely it is to change. 
That leaves us with four quadrants that we can discuss here:

**The Abstract Zone:**
This zone represents classes that rarely change but that have _lots_ of dependents.
Typically this zone includes abstract classes and interfaces (either the explicit ones in languages that need them, or the ones implicitly defined via duck typing). 

This is a _good_ zone: If we accept that classes _need_ to depend on other classes to get anything done, then we want these dependencies to cluster around classes that, at least, rarely change, which _probably_ means that these classes are more on the abstract side.

**The Concrete Zone:**
Not called that way in the book, but I like the name as it contrasts with the Abstract Zone. This quadrant has those classes that are quite likely to change but that have few or no dependents. This is also a _good_ zone: Through our thoughtful design, we have reduced the impact of the likely changes. How did we get rid of the dependents of the concrete classes? By extracting the abstract ideas behind the concrete classes and movign the dependents over to those abstractions!

**The Neutral Zone:**
Classes that are neither likely to change nor cause a lot of trouble if they were to change. Certainly nice to have, but there always has to be a certain amount of change and of dependency in our application, so the interesting stuff happens in the previous two zones.

**The Danger Zone:**
Finally, we have the quadrant of classes that are likely to change _and_ that have many dependents. This is the place where coding horror and spaghetti code live: Frequent changes that break lots of things make programming a nightmare. Be aware when you run into a class like this and consider if you can tackle it via reversing the direction of dependency, or extracting an abstract interface.

# Summary
Not much to add to what the author already summarises so I won't plagiarize his excellent summary :)

