---
layout: post
title: Practical Object Oriented Design - Book Notes - Chapter 4
categories: [development]
---
This is the fourth part in my review and reading notes on the Practical Object Oriented Programming book (www.poodr.com) by Sandi Metz.

Okay now it's getting interesting: OOD is about _messages_ more than _classes_. 

* _What_ objects know = Their responsibilities
* _Who_ objects know = Their dependencies
* How classes _talk_ to each other = The messages and their _interfaces_

# Understanding Interfaces
Nerd time: Think of classes as nodes in a graph, and of messages as directed edges. Good design has a _sparse_ graph: Any given node should have a relatively low number of outgoing edges, or at least there should be small clusters of higher connectivity, with the clusters in turn being loosely connected to each other.

More nerd time: If "everybody talks to everybody else", then with _N_ classes you will have 
O(N^2) edges. That is, the number of communication paths grows quadratically with the number of classes. That quickly becomes overwhelmingly complex.

Hyper-connected objects are difficult to reuse and change.

Instead, low-connected components allow easy reuse and low-consequence change.

High-density message graph is _not_ necessarily the result of failed dependency injection or single responsibility! You can easily design an application that follows those principles while still ending up with a dense message graph.

Problems aren't with what the class _does_ but with what it _reveals_. To arrive at a low-density message graph, you need to _constrain_ which messages can pass between objects.

In some programming langauges, a class can explicitly declare its methods to be either public or private. In Python, though, all class attributes and methods are public. There is, however, a _convention_ which states that, as a programmer, you should treat attributes and messages that start with an underscore _as if_ they were private. That is: Don't depend on their behavior, don't depend even on their existence. With the underscore prefix, you signal to other programmers and to yourself that this message is not part of the class's public interface.

In this chapter, _interface_ refers to the methods _within_ a class, as opposed to the more abstract concept of interface we'll talk about in the next chapter.

# Defining Interfaces
The author gives a great example of an interface that hides complex implementation details with the restaurant kitchen analogy. Another example I can think of: The devices we use every day also have devices that hide the implementation details. I don't need to know anything at all about electronics to use a TV. I don't need to know anything about how an internal combustion engine _actually_ works to drive a car. The interface provides me with means of telling the device _what_ I want from it (go faster, slow down, go left, go right) without me having to bother at all _how_ this behavior is achieved.

## Public Interfaces
Just some bullet points here.
* Public methods = Face of your class
* Tell you what it's primary responsibility is
* Are _expected_ to be invoked by others
* Will _not_ change on a whim.
* Are (more or less) safe for others to depend on.
* Are thoroughly documented in tests.

## Private Interfaces
All other methods = private interface
* Handle implementation details
* Are _not_ expected to be sent by other objects
* Chan change for any reason whatsoever
* Are _unsafe_ for others to depend on
* May not even be referenced in tests

## Responsibilities, Dependencies, and Interfaces
* If a class has a single _purpose_, then things it does (its specific _responsibilities_) are what allow it to fulfill that purpose.
* Public methods = description of its responsibilities.
* Public interface is a _contract_.
* Example of Stack: `push` and `pop` is pretty much all you need. Internal details should be hidden. 
* Remember: Depend on things that are more stable than you. Applies to classes (previous chapter) but also applies to methods. What's that mean? Don't _depend_ on private methods.

# Finding the Public Interface
* It's an art
* No hard rules
* Recall the design goal: Maximum future flexibility with not too much work right now.
* Now some rules of thumb and a new tool: Sequence Diagrams.

## Example
Author introduces an example _domain_. I won't repeat that here.

## Constructing an Intention
Here author has a bit of a discussion on "test first" programming, also called TDD for Test-Driven Design. The idea of that design technique is to write unit tests first, and let the tests guide you into what code to write for your program. However, as the author argues, that often does not end well for _novices_ to design, because if you don't know _which_ tests to write, and _how_ to write them, they cannot possibly guide you to a good design. 

Once you have acquired good design experience and intuition, you will know which tests to write to hone in on the specific design that will work well for your given situation.

The authors calls this "having an _intention_ about the application": To write test-first in a good way, you need to know: "I want my object to have this method, which should exhibit this behavior". 

Going a step further: Before writing these tests you also need an idea about _which_ objects you will have. Novices focus overly on the _domain objects_. The concrete, tangible things. The _nouns_ of the domain, if you will. What is more important, though, is what _message_ you intend to pass between these objects!

So before you do anything, figure out what objects _and_ what messages you'll be dealing with.

## Sequence Diagrams
How do we sketch out what messages we're dealing with? Sequence diagrams! Subset of UML (Unified Markup Language) diagrams. I won't repeat the chapter content and diagrams here, just pointing out that there's a free Sequence Diagram Tool here:
https://sequencediagram.org/

Why are these diagrams so great? Because they force you to be clear about which messages you are going to send. That, in turn, allows you to ponder whether you're sending them from and to the right objects. And since you're only supposed to send messages that are in the public interface of classes, the diagram helps you figure out what the public interface should be.

Let's emphasize this: Instead of deciding on a class, and _then_ figuring out what its responsibilities are, you decide on a _message_ you want to send, and then figure out who should send it, and where to.

I'll quote:

> This transition from class-based design to message-based design is a turning point in your design career. The message-based perspective yields more flexible applications than does the class-based perspective. Changing the fundamental design question from “I know I need this class, what should it do?” to “I need to send this message, who should respond to it?” is the first step in that direction.

> You don’t send messages because you have objects, you have objects because you send messages.

When focusing too much on classes, we risk that our messages aren't sent to the right place.

The book then goes through a concrete example involving a bicylce trip agency and how a sequence diagram can help identify issues with the objects and messages. 

## Asking For "What" Instead Of Telling "How"
One such issue is about messages that are too explicit in what exact behavior they want to see.

You want to be sending messages that tell the receiver what sort of result you want from them. You want to avoid sending messages that tell the receiver how to behave.

In the restaurant example, you tell the waiter which dish you would like. You don't tell the waiter "Please write this dish and my table number onto this note and then go put that note onto the stack of kitchen orders and then wait for the chef to make the order and then bring it to me".

The book example explains this via the bicycle mechanic class. In a first version, the trip class explicitly states all the different actions that a mechanic should take to prepare a bike. This is a case of telling "how". 

A good test to see if your design falls into this trap is to imagine your classes again as people, where a message is like an order or request. Now imagine the sequence diagram as a conversation between the people. If one class feels like it's a tyrannical micro-manager toward another, you need to rethink your design!

If your messages instead focus on the high-level tasks and results you want to see, the object that sends the message needs to know much less, and the object that performs the task can have a much smaller public interface. 

## Seeking Context Independence
An object's _context_ is formed by all the things it expects to be in place and available to perform its job. Typically, this context involves what sort of messages your object expects to be able to send to other objects, with some assumptions about the behavior.

Look again at the toy example from my previous writeup, with dependency injection:

```python
class A:
	def __init__(self, job_helper):
		self.job_helper = job_helper
		
	def do_your_job(self, arg1, arg2):
		intermediate_result = job.process(arg1, arg2)
		return self.some_more_processing(intermediate_result)
	
	...
```

Here, the _context_ of class `A` is "an object that understands the `process(arg1, arg2)` message".

Obviously, the bigger an object's context, the harder it is to use, re-use, and test the class, because you first need to _create_ the correct context. This suggests that good design seeks to write classes that require only a small context. The _best case scenario_ of course is a class that is context-independent.

To be context-independent means being able to cooperate with other objects without knowing _who they are_ and _what they do_. Using dependency injection takes care of the _who_ part. Rethinking the sequence of messages, and working toward simplifying the messages, takes care of the _what they do_ part.

I like the author's example here with the Trip and the Mechanic. The key technique the example in this subsection introduces is: You can simplify (and thus potentially unify) the message you send to your collaborator by _not_ passing in lots of arguments, but rather having a public interface that lets your collaborator ask you for those arguments themselves.

Maybe we can use the restaurant example again:
![Sequence Diagram for ordering a burger explicitly](/images/poodr_4/burger_1.png)

Here we see a Customer ordering a burger, which needs a bit of extra info about the side dish. Sending messages like this requires having a method for each of the different things you could order in different ways. It means `Customer` expects in its context an object `Waiter` that understands all sorts of messages. 

If we have our objects collaborate more, however, we can have a simpler context:
![Sequence Diagram for ordering a burger with less context](/images/poodr_4/burger_2.png)

and we'd imagine that it's the customer's interface's job to provide methods to inquire about certain preferences, like doneness of a steak, whether Pepsi is okay, and if there's allergies.

## Trusting Other Objects
In the real world, you are only comfortable asking for the what without specifying the how if you have trust that your counterpart is capable of fulfilling that request. When writing your own classes and objects, you should always trust an object that it is capable of fulfilling its responsibility!

As the author argues, the various sequence diagrams of the section show how a programmer's understanding and use of objects improves over time:

The first stab is essentially _procedural_. In a purely procedural program, you have some `main()` routine that, in sequence, calls the various procedures (functions) it needs to get its job done. Just because you put your `main` into one class and all the procedures it calls into another class does not make your code truly object oriented!

In the next version, the detailed knowledge of which functions to call in what order to accomplish a given task has been moved to the correct class. The "main" class asks the helper class to achieve a specific result, but does not itself specify how that is achieved.

In the final version, the _context_ of the main class is reduced further. The difference in the author's example between `prepare_bicycle(bike)` and `prepare_trip()` is subtle but profound. Preparing a trip, rather than preparing a bike, is a more _general_ concept. As such, it is more stable and more reusable. We _trust_ that the Mechanic class itself knows that, in order to prepare a trip, it must prepare a bike. 

The impact of this subtle shift becomes more visible when we imagine that a trip has many different things that need to be prepared other than getting bikes ready. Code quickly becomes messy if we have to send specific "you prepare this, and you prepare that" messages to all the different classes that help us get ready for a trip. Much better if we can just send each class the same `prepare_trip` message and the classes themselves know what to do.

## Using Messages to Discover Objects
The sequence diagrams should be understood as lightweight, temporary, throw-away tools that help us discover which objects our application needs. We do this by examining what types of messages are reasonable to _send_ and then carefully scrutizing what sort of object should be responsible for _receiving_ that message.

This view of putting messages first is incredibly helpful. Focusing too much on the existing objects makes it tempting to just shove messages into whatever objects are already there. Focusing instead of the messages we want to send allows us to create the right class, with the right single responsibility, for handling that message.

# Writing Code That Puts Its Best Interface Forward
In this section, the author shares useful rules of thumb for creating good public interfaces. In any way, you should always _think_ carefully about your interfaces, as they control more than anything else how your codebase will evolve.

## Create Explicit Interfaces
Python has no explicit concept of private versus public methods, but convention says that methods prefixed with `_` should be _considered_ private and _not_ be depended upon.

The public methods are those that you want other classes to call and depend on. Therefore, they should be:
* Explicitly identified as such. In Python, that just means _not_ having the `_` prefix.
* Be more about _what_ than _how_. Remember to trust your objects.
* Have descriptive names that won't be subject to change, as much as possible.
* Prefer keyword arguments.

## Honor the Public Interfaces of Others
Basically, avoid as much as possible depending on private methods of other classes! In some languages this isn't an _option_, but Python of course does not prevent you from calling a method just because it was prefixed with the underscore. 

Still, all sorts of alarm bells should be going off in your head if you ever feel tempted to invoke such a "private" method. The person who wrote that class's interface decided to mark that method as private for a reason: It is considered an internal detail of the class, subject to change at a whim, with no promises made to preserve the private method. 

Chances are, when you find yourself calling a private method, that you're telling a class _how_ to do something rather than asking it for _what_ you want done. Rethink your design!

If you are convinced that it absolutely cannot be avoided to call a private method, isolate this dangerous dependency from the rest of your code base so that the private method is referenced from only one place, instead of all over your application.

## Minimize Context
As discussed above, a class's context is the set of other classes and things that are required to be in place before a class can actually do its job. Smaller is better. In terms of a public interface, then, this means providing public methods that allows senders to get what they want without having to spell out the steps needed to get there.

Basically, if you don't want your class to be micro-managed by other classes, it is your job to provide methods that represent high-level results instead of low-level actions.

If you have to use someone else's class with a poor public interface, you should also consider putting in the work to wrap the bad interface into a class or method that provides a better interface.

# The Law of Demeter
I have talked about this before on this site so I won't go into too much detail again. I like the author's nuanced approach to the law so I will comment on that a bit.

The Law of Demeter, in short, says to avoid _train wrecks_ of long chains of methods. But there are subtleties to conisder.

## Consequences of Violations
Whenever someone states that there's a law you shouldn't violate, a natural question to arise is: "Or else?". 

* A long message chain increases coupling between distant objects. Ask yourself if that coupling is appropriate and unavoidable.
* Depending on a long message chain increases an object's _context_: More things need to be correctly in place, making reuse and testing cumborsome!

There's a few different _types_ of message chains, and the law's importance depends on that type.

* You could be retrieving a _stable attribute_ via some intermediate objects. In this case, balance the cost of removing the violation against the likelihood of this chain breaking.
* You could be invoking distant behavior. This is most likely a situation where you are telling _how_ rather than _what_, and hints at a deficient public interface. More on this later.
* You could be chaining together methods that have the same return type; often called a _fluid interface_. In this case, all is fine, as the Law of Demeter only concerns method chains with different objects along the chain.

## Avoiding Violations
Sometimes when the Law of Demeter is discussed, _delegation_ is sold as the way to avoid the violation:
```python
class A:
	def get_something(self):
		...
		return some_object
	
class B:
	def do_something(self):
		...
		
# Some code:
A().get_something().do_something() # Law of Demeter violation
```
The idea of delegation is that we move the message chain into the classes:
```python
class A:
	def get_something(self):
		...
		return some_object
	
	def do_something(self):
		return self.get_something().do_something()
	
class B:
	# unchanged
	
# Some code:
A().do_something() # Hah! No Law of Demeter violation!
```

At times, this can be the appropriate course of action, but pay attention! You might still be violating the law _in spirit_ if not in letter. Thinking back to our discussion about messages and their appropriate senders and receivers, does it _make sense_ for `A` to receive this particular `do_something` message?

## Listening to Demeter
What the Law of Demeter _really_ wants to tell us is that we are either missing objects, or methods, that would allow our objects to communicate in a more useful way! According to the author, these _train wrecks_ happen if we focus too much on the objects we already have: This leads us to chain method calls together to assemble some desired behavior. If instead we focus on the _messages_ that we _should_ be sending, we will discover which objects need to receive them:

In the preceding examples, we discussed why it's bad if one class tells another class in too much detail exactly what to do. Even worse, then, is if we have one class that tells another class to tell another class exactly what to do.
