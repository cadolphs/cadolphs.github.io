---
title: Practical Object Oriented Design - Book Notes - Chapter 2
date: 2020-10-30
---
This is the second post in my book review / book notes series about "Practical Object Oriented Design" by Sandi Metz. (https://www.poodr.com/)

In the last chapter we learned that design is all about writing code that is easy to change.

In this chapter we will learn about one important principle that gets right to the core of this principle: Designing classes with a **single responsibility**.

What makes writing good classes so tricky is the great fluidity they afford. There is only a handful ways to write your for-loops and if-clauses such that they actually perform the algorithm you want them to. There are a myriad ways to arrange functionality across classes. 

Some of the questions that arise are:
* What are your classes, i.e. by what concepts is code organized in your program?
* What behavior will they implement? What are the class's responsibilities?
* What does one class need to know about another class, i.e. what are the dependencies?
* What internal data does a class reveal to other classes, what is kept hidden?

As was discussed in the previous chapter, there's really two main requirements that dictate what this arrangement should be:
* The application should work _right now_ and do what it's supposed to do.
* The application should also be _easy to change later_.

These requirements can be at odds sometimes, especially when a deadline looms. But here is a great quote from the book:

> Your application needs to work right now just once; it must be easy to change forever.

# What does Easy to Change mean?
Okay, so we agree that code should be easy to change. But what does that concretely mean, and how do we create code that actually _is_ easy to change? Here I want to dig a bit deeper into the author's definition.

## Transparent
In complicated, tangled code (so-called spaghetti code), a seemingly benign change in one corner of the program has unexpected and detrimental consequences in a completely unrelated corner of the program. Often this happens when code depends on obscure implementation details and thus becomes fragile.

Code that is easy to change should therefore be **transparent**. You should be able to look at a proposed change and see what it will do to the code immediately around it, but also to code far away. 

## Reasonable
The author asserts that small changes in requirements should require correspondingly small changes in code. This can be a bit tricky in scientific scenarios (see, e.g., https://xkcd.com/1425/). _Small_ is thus a somewhat vague term and what counts as a small change in requirements is not always obvious. 

However, what we can demand is that _if_ a small change in requirements needs big changes in code, this should be due entirely to the nature of the changes and not due to the nature of the way the code is arranged. The new or adjusted feature might require a lot of coding, but once that is done we should be able to neatly drop it into place without much fuss.

## Usable
The code that already exists should be easy to re-use. Often, new requirements are just small tweaks or recombinations of existing behavior. The better the code is designed, the easier it is to get at these pieces and combine them in useful ways.

## Exemplary
Here the author says:
> the easiest way to make a change is to add code that in itself is easy to change

So basically, write code that is good in a way that it inspires other developers (or future-you) to _also_ write good code, i.e. code that is easy to change.

----
These code qualities spell out "TRUE". Code that is TRUE will be easy to change and adapt to new requirements. So far so good in that we now have a few more concrete definitions to attach to our idea of "easy to change" code. That still leaves the question of _how_ we arrange our code such that it is true. 

Each design principle will touch on all of the TRUE qualities. The very first step, according to the author, is to ensure that your code adheres to the **Single Responsibility Principle**

# Creating Classes That Have a Single Responsibility
Let's put aside for a moment the question of what exactly counts as a responsibility and just accept the fact that the stuff a class does fulfills one or more responsibilities.

The Single Responsibility Principle (SRP) then states that a class should have a single responsibility. You might say each class should do one small useful thing and not more.

Now how does that help in making your classes TRUE? Let's have a look.

## Transparent
A change in a class with a single responsibility will affect how that responsibility is handled, and nothing else. This limits the unexpected consequences of a change, though it is not a silver bullet. You can still write badly tangled code that adheres to the SRP. 

## Reasonable
If you have a bunch of responsibilities and a bunch of classes, and each class has exactly one responsibility, it follows mathematically that each responsibility is fulfilled by exactly one class.

So if you want to make a small change to your application, you will only be dealing with a small number of behaviors that you need changed, and that means you will only be modifying a small number of classes. The smaller the change, the fewer classes will be affected. This is great! Compare this to spaghetti code where a seemingly small change requires each and every class to be changed.

## Usable
This quality most clearly benefits from adhering to the SRP. If each class has exactly one responsibility, it is much easier to re-use it in a different context than if it was carrying with it a bunch of responsibilities. Let me use a concrete example:

I was reviewing code I had written some time ago for a project and there was a class that performed a certain data transformation step ("raw" problem input to a specific formulation of the problem that would then be passed on to a solver). But it _also_ performed the loading from file of that raw problem input. Now I wanted to re-use the problem transformation capability in a new context but that was very awkward, because that whole file-loading stuff wanted to come along for the ride. And it wasn't even "just there" and could be ignored. Rather, the way you created an instance of that whole problem-loader-and-transformer was to pass in the filename of the raw problem data. No way for me to say "Wait, I already have the data loaded, I just want to make that transformer class!"

This is the case more often that not: If a class has more than one responsibility, they will be strongly entangled. Because if they weren't, you'd probably already have split everything neatly into two classes! 


# But What Are Responsibilities?
We have seen why a well-designed class has only a single responsibility. But what counts as a responsibility? If we want to be narrow and nitpicky, then every method implemented by a class is a responsibility: "Respond to that message". By that logic, a class should have only one (public) method. Clearly that cannot be right.

On the other hand, if we pick our idea of responsibility too broadly, the whole concept becomes meaningless: "My class is responsible for life, the universe, and all the rest."

So let's try and come up with a better concept of responsibility. A class's responsibilities are fulfilled by the class's methods, where each method implements a certain _behavior_. These behaviors should form a _cohesive_ set, all aligned with a single, small responsibility.

Since so much hinges on the class's methods, let's go on a quick detour about them

## The Single Responsibility Principle for Methods
Both in the "Practical Object Oriented Programming" and in the classic "Clean Code" by Robert "Uncle Bob" Martin the authors discuss the importance of writing functions (and thus methods) that do _one thing_, not more. The same reasons apply as for classes: Doing more than one thing makes everything that much more complicated, entangled, and less useful.

I highly recommend checking out the chapter on functions in "Clean Code" and internalizing these principles. It is an immediate win for your code quality if you start writing shorter, more focused function that do one thing, and one thing only. Bonus points if that one thing is clearly discernible from the function's name.

Now while writing functions that way is a great idea in its own right, it becomes especially important when you want your class's methods to guide you to a better design: If each method does _one_ clearly defined thing, then you can easily tell whether your class fulfills more than one responsibility or not. If instead lots of behavior is crammed into a single method, it is hard to tell whether the class with that method is fulfilling a single responsibility or not. 

## Some Tests for Methods and Where They Belong
Once you have made sure that the methods itself are well-written with a single responsibility per method, you can use a few tests to see whether the method indeed belongs in the class it is currently in:

### The "Interrogation" Test
If we view methods as "messages" that an object responds to, you can view them as questions or commands. So pretend that your class is a person and, for each of its methods, make that command or ask that question.

As a concrete example, I remember in one of my projects we had a class `SchedulingProblem` that was meant to represent the "Problem" from the end user's point of view. During a code review, I found that someone had added a `get_number_of_processors()` method to it, for the purpose of parallelizing some calculation. I could certainly see how it was convenient to add that method there. But using the interrogation test, "Dear Mr. Scheduling Problem, how many processors do you have?" doesn't quite make sense.

### The "Summary" Test
Try summarizing what the class does, or is responsible for, in a single sentence or maybe paragraph. Can you do it without using "and"/"or"?

To quote from the book, if you have to use "and" there's a chance your class is responsible for two things. If you have to use "or", chances are not only is your class responsible for two things, these two things aren't even that closely related!

### The Cohesion Test
Cohesion, in the context of Object Oriented Design, measures how much each method of a class operates on that class's attributes. Consider this, admittedly, very tiny example:

```
class Stack:
  def __init__(self):
    self._internal_list = []
	
  def pop(self):
    value = self._internal_list[-1]
	del self._internal_list[-1]
	
  def push(self, value):
    self._internal_list.append(value)
```

Each method of this class interacts with the class's only attribute. Such a class would be considered maximally cohesive. It is neither required nor desirable to always achieve 100% cohesion in a real-world class. However, low cohesion often points at potential problems.

Often you will find that you can group the class attributes together based on which subset of methods operates on them. This is a clear sign that your class wants to be broken up into two classes. Sometimes it is a clean break where one group of methods only accesses one group of attributes. But even if the break isn't clean, you can still improve the design by going from one class to two classes that now might need to share some information via methods.

## When to Make Design Decisions
This is a great section in the book. Especially at the beginning of a programming project, or at the start of adding a whole new set of functionality, you might end up with a class where you feel that its design isn't quite right. But you also have no clue how to improve it because so little is known about how it will change in the future.

At this point, you should weight the cost of trying (guessing, really) at the perfect design for a potential future change versus the cost of doing nothing now and leaving the decision for later, when more information arrives. The whole point of good design is to reduce the cost of future changes; so if doing "something" right now doesn't help reduce that cost, just don't bother.

The only small issue then is that others might look at your currently imperfect class and think it's "okay" to code in that style. So maybe you _should_ improve the design right now? But then again, we lack the good information as to how.

# Writing Code That Embraces Change
This section steps away from the overall "single responsibility principle" for a moment to discuss how you can solve the dilemma of having to write changeable code in a way that doesn't already pressupose _what_ the change will be.

I will only briefly comment on them. The description are fine as they are, but there's a twist in Python.

## Depend on Behavior, Not Data
To summarize:
- Behavior is captured in methods; it's in the _messages_ you send an object.
- If your class has a single responsibility, every behavior is contained in one, and only one, place
- Thus if you depend on behavior, your code can tolerate change because there's exactly one place to look for a particular behavior
- Classes also contain _data_, contained in the _instance variables_. Don't depend on data!

Why not depend on data? Because that "leaks out" the internal details of your class and means that you cannot change how the class deals with that data to produce behavior; other classes have taken it on themselves to add behavior to that data.

### Hide Instance Variables
The way in most programming languages to achieve this _encapsulation_ is to declare all instance variables as _private_ and only provide access via getter/setter functions (if at all!).

In Python, things work a bit differently. First, there are no _true_ private instance attributes. It is merely accepted convention that attributes (and methods) of a class that begin with an underscore are _considered_ private implementation details and _should not_ be relied upon.

When it comes to public attributes, Python has a nice feature in the `@property` decorator that allows a seamless switch from attribute to getter/setter. Consider this simple example:

```python
class Circle:
	def __init__(self, radius):
		self.radius = radius
	
	def compute_circumference():
		return 2 * self.radius * math.pi
```

Someone who uses the circle class can happily access (and set) the radius by directly accessing the attribute: `my_circle.radius = 3`

What if, for whatever reason, we want to change the way the circle is internally handled, and store the diameter instead of the radius? In many other programming languages, the fact that external code directly refers to `radius` means we cannot easily change it to something like `get_radius()`. In Python, however, we can just change it from an attribute to a property:

```python
class Circle:
	def __init__(self, radius):
		self.diameter = 2 * radius
		
	@property
	def radius(self):
		return self.diameter / 2
	
	@radius.setter
	def radius(self, new_radius):
		self.diameter = 2 * new_radius
```

So when should we use these properties and when should we use functions with explicit names like `get_radius()`? Ideally, our class structure allows us to mostly rely on invoking behavior through methods, so we should not be dealing with too many attributes to begin with! Our first instinct should always be to hide data and let the classes work it out via methods that invoke behavior. Tell, don't ask! If it is indeed necessary to expose a class's attributes, we can start with the simple, direct attribute way and change to the property decorator later, if necessary. For _complex caluclations_, I suggest making explicit that something is being computed or retrieved etc. Something behind a property should be just a simple lookup or conversion!

### Hide Data Structures
Let's talk about DRY. It's another one of these important design principles, and stands for **Don't Repeat Yourself**. Every bit of knowledge should have one definite place where it is defined. Some obvious cases of DRY-violations are lines of code that are copy-pasted instead of being extracted into a function. Some cases are more subtle.

Consider this class:
```python
class SomeContainerForTimes:
	def __init__(self, data):
		self._data = data
		
	@property
	def data(self):
		return self._data
	
	def convert_to_minutes(self):
		return [60 * item[0] + item[1] for item in self.data]
		
	# ... lots more methods that explicitly refer item[0] and item[1]
```
So here we have some class that stores a list of tuples and apparently the first position refers to hours and the second position refers to minutes. And then there's lots of methods in that class who explicitly make use of that arrangement.

This is a violation of the DRY principle! The fact that "hours are stored in position 0" is a piece of _knowledge_ which, therefore, should have only _one_ place where it is represented, instead of plastered all over the place. Whenever the data structure would change, each piece of code that uses the structure also needs to change, and that goes for internal and external uses of the `data` array. For example, if we were to expand the code so in addition to hours and minutes it also contains days, we'd probably want to have the days stored at position 0, hours at position 1 and minutes at position 2. Now we'd have to find every use of `item[i]` and update it so it uses the correct index. There's a big chance we'd introduce bugs that way.

What's a solution here? Encapsulate the raw data structure in something more descriptive:

```python
from collections import namedtuple
Time = namedtuple('Time', ["hours", "minutes"])

class SomeContainerForTimes:
	def __init__(self, data):
		self._times = self._convert_raw_array(data)
		
	@property
	def times:
		return self._times
	
	def _convert_raw_array(self, data):
		return [Time(hours=item[0], minutes=item[1]) for item in data]
	
	def convert_to_minutes(self):
		return [60 * item.hours + item.minutes for item in self.times]
	
	# ... lots more methods that now make reference 
	#     to item.hours and item.minutes
```

Now the _knowledge_ that `item[0]` contains hours and `item[1]` contains minutes is stored in only one place: The `_convert_raw_array` method. Every other method (even inside the same class) will now refer to the `_times` list instead of the raw array.

I'll just quote the book here as it's spot on:

> Direct references into complicated structures are confusing, because they obscure what the data really is, and they are a maintenance nightmare, because every reference will need to be changed when the structure of the array changes.

A note about Python: There, we have the built-in `dict` type which is similar to an array except that keys can be any hashable object. We _could_ have used a `dict` instead of a `namedtuple` here, and at least it would have made the structure more clear (we'de be using `data["hours"]` and `data["times"]`) and extensible. 

It may be a matter of taste, but I prefer the `namedtuple` here over a solution with `dict`. I feel that a `dict` is best used as an "array" with advanced keys. In particular, it is useful where we don't know in advance what the keys are. For our time object, we need `hour` and `minutes` and that's it. Declaring a named tuple makes this explicit. It should also have a smaller footprint than a `dict`.

An added benefit is that the syntax for item access of the `namedtuple` makes it easy to later change it to a full-blown class in case we want to add behavior to the `Time` object.

### Enforce Single Responsibility Everywhere
I have already touched upon the points of this subsection in the "Single Responsibiltiy Principle for Methods" section. I cannot emphasize enough how radically transformative your coding becomes once you start _radically_ enforcing this principle and write methods that truly do one thing only!

Let's recap what the author thinks about these qualities. Methods with single responsibilities have these benefits:

* Expose previously hidden qualities

I touched on this above; once all your _methods_ have a single responsibility, you can then determine whether your _class_ has a single responsibility simply by looking at the methods.

* Avoid the need for comments

Another great chapter in Clean Code talks about comments. As a novice programmer, I thought more is better when it comes to comments. I have since learned that comments are often used as deodorant to mask *code smells*. If you feel like you should write a comment, try and improve the code instead so the comment becomes unnecessary. One such way is to take the code that had the comment and extract it into a single method, with the name of the method replacing the comment.

* Encourage reuse

If your method combines reading some data _and_ processing the data, the only way to reuse the method is to also read data _and_ processing it. What if you wanted to reuse only the processing part, or the reading part? When you write your small single-responsibility methods, you will create many small methods that form the _building blocks_ for the higher levels of functionality. It is these building blocks that will make your code easy to reuse _without_ copy-pasting.

* Are easy to move to another class

In the spirit of designing code that is amenable to change, small methods are easier to move to another class than large methods. This encourages you to improve your design, because it lowers the barrier to such refactorings.

### Nested Classes
The book chapter closes with a section on isolating behavior inside classes. Basically, if you feel that certain methods do not belong in the class they are currently in, but you don't know yet where they _should_ belong, you can create an _internal_ (or _nested_) class inside your current class and move them there. Then at least they're not muddying the class, and once you have more information about what design you want, the nested class will be easier to extract.

# Summary
This was a big chapter and explained one of the foundational principles. At this point it might still be rather abstract. The principles of single responsibility and not repeating yourself should appear agreeable enough, but I hope in subsequent posts to provide more _concrete_ examples of what we might consider to be a responsibility and how to write our classes such they only have one.
