---
title: Practical Object Oriented Design - Book Notes - Chapter 8
date: 2021-01-13
---
This is the eigth part in my review and reading notes on the Practical Object Oriented Programming book ([www.poodr.com](http://www.poodr.com)) by Sandi Metz.

Composition is the concept of combining parts into something larger, and after inheritance and modules it is the third technique for arranging behavior and code for effective reuse.

In this chapter, the author first gives as an example a big refactoring of something that was previously using inheritance into something that now uses composition.

The basic idea is: A complex object may have *parts*. Being a *part* is a *role* and the containing object should be happy to interact and collaborate with any object that implements the appropriate interface!

I will only very superficially touch on the example. Check it out in the original book.

# Composing a Bicycle of Parts

- Flashback to two chapters ago (Inheritance).
- Recall `MountainBike` and `RoadBike` being subclasses of `Bike`.
- What do they *differ* in? Their spare parts!
- So what if we just have one *concrete* class, `Bike` that *has* parts? Then the *parts* can be specific to road bikes and mountain bikes: A road bike is a bike with road bike parts, and a mountain bike is a bike with mountain bike parts!

## Updating the Bicycle Class

- Here we refactor the Bicycle inheritance hierarchy and replace it with composition.
- Basically this is all just about delegating messages!
- Bicycle needs to respond to `spares` message and therefore `delegates` it to its `parts` object.
- Contrast with inheritance: There, a `MountainBike` needed to respond to `spares` message and therefore *delegated* it to the `Biycle` superclass.
- Note: `Bicycle` class now does *very little* indeed. This is just an example. In larger example it would do *other* things; we just moved the things related to spare parts into the `parts` class!

Main takeaway: Inheritance leads to *automatic* delegation. Composition requires *explicit* delegation.

## Creating a Parts hierarchy

- `Bicycle` is a concrete class now; no sub-classes!
- Instead, subclass from `Parts`. *There* we will have that hierarchy.
- In this example, just copy over relevant code from our previous hierarchy.

Common pattern: Using composition and inheritance side by side: An object is made up of parts, and those parts are placed in a hierarchy.

# Composing the Parts object

- So far, `Parts` handled as class using inheritance.
- We can refactor to use composition:
- Obviously a `Parts` object could be composed of many `Part` objects.

## Creating the Part object

- Simple class `Part` responds to `needs_spare`
- Now `Parts` is just a simple wrapper around a `list` of `Part` objects
- It's debatable then whether a `Parts` class is necessary or if `Bicycle` could just hold a `list` of `Part` objects directly. It's *cleaner* conceptually to make a class so interaction and manipulation of the object is "controlled", and implementation details such as underlying data structure (`list` versus something else) are encapsulated.

## Making the Parts Object More Like an Array

- This part felt very Ruby specific; I think Python with its abstract collections base classes might not have the same issues.
- `Parts` is a wrapper around a sequence of `Part` objects
- Programmers / Users *expect* certain behavior and features of a sequence, like being able to iterate over them: `for part in parts:`
- In Python, that means implementing the iterator *protocol* (e.g. `__len__` and `__getitem__`).
- It's your call as the programmer how much work you want to put into making these protocols available.

# Manufacturing Parts

This section does not necessarily have much to do with *composition* but shows a useful technique in object oriented programming: Somewhere in our code we need to create the objects that play certain roles. If the knowledge needed to create these objects is encapsulated in a class, we call that class a *Factory*. We can then ask this factory to make us certain objects that play certain roles without having to know the exact class name involved.

# Deciding Between Inheritance and Composition

Both classical inheritance and composition are ways of organizing and arranging code, and they come with their own costs and benefits. When you use inheritance, you get the benefit of *automated* message delegation, at the cost of placing your objects in a class hierarchy that you need to take care to get right. When you use composition, you have to deal with delegation manually, but the resulting coupling between the objects is much looser. Thus, which of the two techniques is right for your problem depends very much on the context. This section contains a few pointers and thoughts to get this right!

- General rule: When both would work, favor composition.
- If you cannot explicitly defend inheritance, don't use it.
- Inheritance is justified when there are high rewards for low risk.

## Accepting the Consequences of Inheritance

### Benefits

In a well-modeled class hierarchy, your code will be reasonable, usable, and exemplary, but not necessarily transparent:

- Reasonable: Big changes in behavior can often be achieved with small changes at the top of the inheritance tree
- Usable: The code in a correct hierarchy can easily be reused by just adding yet another subclass extension to it.
- Exemplary: If the hierarchy is correct, then adding these new subclasses will be easy, and one can readily figure out what one must do by checking the code of existing subclasses.

### Costs of Inheritance

Note that these benefits only come to pass when you use inheritance for a problem that suits it. Otherwise, you experience the flip side of the benefits:

- Because changes at the top of the hierarchy have an outsized effect, the cost of changing things in an incorrectly modeled hierarchy is extremely large!
- An incorrectly modeled hierarchy is hard to re-use because the contract implied in inheriting from the hierarchy might be too restrictive.
- Finally, extending an incorrectly modeled hierarchy will often require ugly hacks that are *not* exemplary of good code.

### Python vs Ruby

Here is one quote from the book that does not necessarily apply to Python:

> Avoid writing frameworks that require users of your code to subclass your objects in order to gain your behavior. Their application’s objects may already be arranged in a hierarchy; inheriting from your framework may not be possible

In Python, we have frameworks such as Django, or PyTorch, that make liberal use of inheritance, and those frameworks seem to be quite reasonable. In Python, we have of course the option to use multiple inheritance, so we can mix the framework hierarchy with our own hierarchy. Still, it is a good idea to first stop and consider whether inheritance is the *best* way to grant access to our framework's behavior, or whether composition might be better.

## Accepting the Consequences of Composition

As mentioned before, in composition we don't depend on any pre-defined class hierarchy, and therefore the composed objects deal with message delegation manually. The pros and cons are therefore different:

### Benefits of Composition

If done right, composition involves the creation of many small, independent objects with single responsibilities and well-defined public interfaces. Measured against the code qualities, such a system is:

- Transparent. Each class is small and has a single responsibility. The effect of changes to the object are easy to understand.
- Reasonable. Changing the behavior of the whole often means simply plugging in a different object for a given part. An example for this is that we can turn a `RoadBike` into a `MountainBike` simply by plugging in a `MountainBikeParts` object into the `Bicycle` class rather than a `RoadBikeParts` object.
- Useable. Because the objects are small and have well-defined interfaces, they are easy to re-use in new contexts.

### Costs of Composition

Because we don't get the automatic message delegation that inheritance brings, a composed object must know explicitly which message to delegate to which other object. This might lead to a lot of repetition in the code. Also, if the composed object and its relation to its components is overly complicated, then even if each component is very small and easy to understand, the whole that they build might be very complex: Changing the behavior of one small component might have only a small effect on that component, but a huge effect on the behavior overall.

So in this sense, composition is great at explaining how an object is made of parts, but not so good at dealing with lots of parts that are almost the same.

## Choosing Relationships

What follows are some rules and heuristics for picking either of classical inheritance, modules/mixins, and composition to deal with your problem. And of course it does not always have to be a binary either-or decision: You might use composition to model one relationship between an object and its parts, and then use classical inheritance among the parts that are almost identical.

### Use Inheritance for is-a Relationships

If the core of an object's identity is that it *is a* specialization of a general concept, inheritance might be the right choice. Especially if this modeling results in a shallow, narrow, hierarchy and thus your costs for being wrong are low.

On the flip side, do *not* use inheritance just to get your hands at *some* of the behavior of some existing class. Just because a dog has four legs doesn't meant you should inherit from an existing class `Table` just to get support for legs...

### Use Duck-Types for behaves-like-a Relationships

When an object plays a role, but is not entirely defined by that role, we have a duck type. Examples include the `Schedulable` and `Preparer` duck-types of previous sections. It is common that many otherwise completely unrelated objects end up playing the same role in a given context. Placing these objects into a classical hierarchy would make little sense.

Instead, identify the interface of the duck type and make sure the players of that duck type implement that interface. This can be done informally (at least in dynamic languages) or formally (e.g. by defining a purely abstract base class) depending on how much structure you need.

If the duck type shares behavior, and not just the interface, use modules (in Ruby) or mixin classes (in Python).

### Use Composition for has-a Relationships

Sometimes this is obvious: A car has wheels, a bicycle has a chain and other parts etc. The important thing is that a bike is *more* than its parts.

There might be cases where this is not as obvious as it could be. Let's go back to an early example. Imagine for a moment that Python's `list` class did not already have methods for treating it as a stack (first-in-first-out data access) and we wanted to write our own `Stack` class, with just the two methods of `push` and `pop`.

Someone might be tempted to use inheritance here:

```python
class Stack(list):
    def pop(self):
        item = self[-1]
        del self[-1]
        return item
    
    def push(self, value):
        self.append(value)
```

The issue here is that a `Stack` has some fundamental differences from a `list`. Most importantly, data access *only* happens at the top of the stack. But by inheriting the full interface and behavior from `list`, nothing would stop us from accessing items in the middle:

```python
my_stack = Stack()
my_stack.push(1)
my_stack.push(2)

my_stack[0] = 5
print(my_stack)
# [5, 2]
```

We *could* try and prevent this by overriding the `__setitem__` and `__getitem__` methods in `Stack` to prevent this random access, but think about what that means in terms of the class hierarchy: `Stack` says "I'm a list!" but then says "Yeah but don't access me like a list!". In other words, the `Stack` class is _not_ substitutable for the `list` class!

It would be much more accurate to say that a stack *has a* list (or whatever else we decide to use internally for storage):

```python
class Stack:
    def __init__(self):
        self._items = []
        
    def pop(self):
        item = self._items[-1]
        del self._items[-1]
        return item
    
    def push(self, value):
        self._items.append(vale)
```

Now trying to set values via `my_stack[0] = 5` would give an error. And if we decide that we don't want to use a list to store the items but something else (a linked list, maybe?) we can make this change without changing the interface of `Stack`.

# Summary
Classical inheritance, modules (or mixins) and composition are all great tools with justifiable use cases. They're all awesome when used in the right context, and they all have the potential to produce hard-to-maintain code when used in the wrong context. The last three chapters have hopefully demonstrated a number of principles that help deciding on which technique to use.

And if you ever chose the wrong technique, don't hestitate to refactor to something more suitable!
