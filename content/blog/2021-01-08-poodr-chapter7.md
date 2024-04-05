---
title: Practical Object Oriented Design - Book Notes - Chapter 7
date: 2021-01-08
---
This is the seventh part in my review and reading notes on the Practical Object Oriented Programming book ([www.poodr.com](http://www.poodr.com)) by Sandi Metz.

Now so far it was relatively easy to talk about Python even though the book is written from a Ruby perspective. This chapter is the first big deviation. Modules, in Ruby, are something altogether different from Python modules. They are most closely related to the idea of a *mixin* class: A collection of methods that you can add into an existing class. These modules are *a bit like* multiple inheritance, so let's start with a very brief detour on that.

# Multiple Inheritance

Lots can be written about multiple inheritance, but we try and keep it brief. Multiple inheritance is the concept of a given class having not one, but *several*, base classes. Some languages have it (C++, Python) and some don't (Java, Ruby). Those languages that made the conscious choice not to offer multiple inheritance do so because it comes with *lots* of potential for confusion.

If we recall that inheritance is a form of *automated message delegation*, we can immediately see where such confusion comes from: If `A` inherits from both `B` and `C`, then to which class's method does `A` delegate, in what order? This is called the *method resolution order*, or MRO. In single-inheritance languages, this is easy to compute: You delegate first to your immediate super-class, then if the super-class doesn't implement that method either, you look further up along the chain. With multiple inheritance, though, instead of a chain we have a *graph*, with potentially multiple paths.

## Ruby Modules

So how are modules "kind of" like multiple inheritance? They allow your class to automatically delegate messages to these modules (which are *not* classes). And how is that different from *ordinary* multiple inheritance? Because of the clear distinction between modules and classes, it is always possible to *unambiguously* define the method resolution order, without confusion: When calling a method of an object, that object first checks its own methods. Then it checks, in the order of their inclusion, the modules it incorporates (and any modules that those modules in turn might incorporate). If that fails, it will move on to its superclass and check that class's methods, and the modules included by that class. There is never any "branching" that happens, and the famous "diamond" problem (A inherits from B and C, which in turn both inherit from D) cannot occur.

## Python Multiple Inheritance

Python goes a different route. It allows multiple inheritance, and it uses a specific algorithm (called C3) to come up with a method resolution order. The full algorithm is quite complicated, *but* I would argue that creating an inheritance graph where the MRO is not immediately obvious should be considered a *code smell* anyway. The main thing to take away is that the order matters: `class A(B, C)` and `class A(C, B)` will behave differently. In the first case, the MRO is `A -> B -> C` whereas in the second case it is `A -> C -> B`.

The author's goal in this chapter is to explain not just how inheritance works, but also if it makes sense to use it. More on that, too, in the next chapter.

# Understanding Roles

In the previous chapter, we saw how inheritance can be used to re-use code by moving the general concepts into an abstract superclass and then having concrete subclasses provide specializations as needed. This type of hierarchy *also* brings with it a strong semantic component: The subclasses form an *is-a* relationship with the superclass.

Sometimes, though, you want to share behavior among otherwise unrelated objects, where there is no *is-a* relationship. We want to share behavior and re-use code without that semantic coupling that a subclass / superclass relationship involves. Let's follow along with the author.

## Finding Roles

Objects have a type, defined by what class they're an instance of. But objects also  
play *roles*, and a single object might, depending on the context, play many different roles. In the previous "bike shop" examples, a `Mechanic` might play the *role* of a trip preparer, but it might also play some other roles. So we see that the previously mentioned *duck types* are examples of roles: Many otherwise unrelated objects might play the same role if they all implement the same duck type.

Now with many roles, it happens that there'll be a corresponding counter-part role: If there's a `Preparer` then there's (probably) also a `Preparable` role: If you recall, the `Mechanic` class needed to ask the trip for a list of bicycles. So a `Preparable` should have a method like `get_bicycles()`.

The special thing about roles based on duck types is that they are defined *purely* by their interface. But it is easy to imagine that there are roles that are more complex and require specific *behavior*, not just a specific *public interface*. If there's shared behavior, we want to avoid just repeating it in the code. Think DRY (don't repeat yourself). So how do we organize this code that represents the shared behavior?

- In Ruby, *modules* are groups of methods that are independent of class and can be *mixed in* to another class.
- In Python, you'd use multiple inheritance, but with certain self-imposed restrictions to avoid creating a tangled mess of a class hierarchy: You would bundle the shared code in a class with `Mixin` in its name to signify that it's meant to be *mixed in*.

The self-imposed restrictions on multiple inheritance in Python are modeled after the way Ruby modules work: Since a module isn't a class, you cannot *instantiate* a module. In a similar way, a Python Mixin class is not *meant* to be instantiated. We'll see some concrete examples later on.

## Organizing Responsibilities

Here we follow along as the author walks us through another example. I like how she follows the progression of how one might initially tackle a given problem and then discusses how the design can be improved.

In this example, we're looking at scheduling, which means we'll have a `Schedule` class, right? Okay, and then this class is responsible for *scheduling things*. Different things might have different constraints around being scheduled. In the current example, there's a certain amount of *lead time* involved.

In a first version, some object asks the `Schedule` class if some target object could be scheduled. The `Schedule` class then switches on type (uh oh, code smell!) to decide how many lead days to include in the schedule calculation.

Well, not to worry, we know all about using duck types to remove these type switches: The things we want to schedule should implement the `Schedulable` duck type, which means we can *ask* them how many lead days they need. No more type switching required.

But according to the author, that's still bad design! Here's the logic:

- Some *instigating object* wants to know if `target` is schedulable.
- So why not ask the `target` directly? Let objects speak for themselves!

The author uses a great example to show why this is a much better design than using the `Schedule` class. I'll translate it to Python. If you have a python string, you can call all sorts of useful methods on that string: Convert to upper-case, split into multiple strings based on some delimiter, and so on. It would be very un-pythonic (and un-OOD) to have a string just be a dumb (i.e. no useful methods) holder of bytes and move all the string manipulation into a `StringUtil` class.

Great, so how do we go about this? As with classical inheritance, first we'd implement the role *concretely* in one of the classes that exhibit that role. So we pick one of the things that we want to be able to schedule, and implement the `can_schedule` method there. Then we refactor and move the *general* things *up* the hierarchy. In Ruby, we'd use a module. In Python, we'd use a Mixin class.

The "techniques" are the same as with inheritance, really: Use hook methods, promote abstractions up the hierarchy instead of pushing concretions down. And think of Mixins as "behaves as" instead of "is a".

How to go about this?

- First implement the role concretely in one of the classes that should exhibit the role
- Then refactor to move things "up" the hierarchy.
- In Ruby, use module
- In Python, use multiple inheritance

Use all the same techniques! Hook methods! Promoting abstractions up instead of pushing concretions down.

Think of mix-ins as "behaves as" instead of "is-a".

Now let us conclude this section by writing a Python Mixin that roughly does what the Ruby module in the author's example does: So we identified that there is a *role* for objects to be `Schedulable`, which means they should implement the two methods `is_scheduled(start_date, end_date)` and `can_schedule(start_date, end_date`. But really, for pretty much all the objects playing this role, the *behavior* will be generally the same: There are some lead days to take into account and then we just look it up. So we also add a `lead_days` method, meant to be overridden by classes who include the mixin. Here's how it would look:

```python
class SchedulableMixin: # (1)
    
    @property
    def schedule(self):  #(2)
        if self.__schedule is None:
            self.__schedule = Schedule()
        return self.__schedule
    
    def can_schedule(self, start_date, end_date):
        return not self.is_scheduled(start_date - self.lead_days(), 
                                     end_date) #(3)
    
    def is_scheduled(self, start_date, end_date): #(4)
        return self.schedule.is_scheduled(start_date, end_date)
    
    ## Includers may override: #(5)
    def lead_days(self):
        return 0
```

Let's discuss:

- (1) We add the "Mixin" prefix to make it clear that this isn't meant to be a standalone base class, even though there are no abstract methods.
- (2) To be schedulable, you need to keep track of when you've been scheduled. Moving this `Schedule` object *into* the mixin puts the overall responsibiltiy of this on the `SchedulableMixin` and thus reduces the coupling of classes. Here we use double-underscores to make use of Python's "name mangling" feature: If we had named the field `self._schedule` instead, and if a class that inherits from `SchedulableMixin` also happened to have a `_schedule` field, we would be running into a name clash! With the double-underscore, Python just renames `__schedule` behind the scenes into `_SchedulableMixin__schedule_`. So, technically there is still the potential for name clashes if the other class for whatever weird reason also had a field called `_SchedulableMixin__schedule_`. But if you use such weird names without good reason you've really only got yourself to blame.
- (3) This is the "meat" of the general behavior that all the objects playing the `Schedulable` role share: You can schedule a schedulable object if it hasn't been scheduled during the start date, including any lead time, up until the end date.
- (4) Now we just delegate to the contained `Schedule` object (see next chapter for a deep dive into composition).
- (5) In certain languages (Java for example) you can explicitly declare that certain methods may *not* be overridden. Both Ruby and Python do not have this feature, so we just use comments to explain to users: "This `lead_days` method is what you should override, but the rest is general logic that probably should remain untouched". Here we use the hook method technique, as introduced in the previous chapter, to allow classes that inherit from this Mixin to provide their own specialization. The design message then is: Every class that inherits from `SchedulableMixin` *behaves as a* `Schedulable`, and they only differ in their number of lead days.

# Writing Inheritable Code

Sharing inherited behavior without introducing undue coupling or hard-to-extend rigid hierarchies requires very specific coding techniques! Let's take a look at some:

## Recognize the Antipatterns

Your code *might* benefit from inheritance if...

- You use a variable like `type` or `category` or whatever.
    - In this case, classical inheritance might be good! (See also here [https://refactoring.guru/replace-type-code-with-subclasses](https://refactoring.guru/replace-type-code-with-subclasses))
    - Put common abstraction in base class.
    - Provide *specializations* in the child classes.
    - And remember the Liskov Substitution Principle!
- A *sending object* checks class type to decide on what message to send.
    - In this case, all the potential receivers play a common *role*.
    - That *role* is a *duck type*.
    - If duck types share *behavior* in addition to the interface, realize that via mix-in.

## Insist on the Abstraction

The code, both concrete and abstract, that is contained in an abstract superclass must apply to *every* class that inherits it. No exceptions. There is a code smell named after this: [Refused Bequest](https://refactoring.guru/smells/refused-bequest).

And why is this a bad code smell? Because faulty abstractions lead to ugly hacks and fragile workarounds. Remember the subcalss relationship: If `A` inherits from `B`, then `A` **is a** `B`. If `A` then overrides one of `B`'s methods to, say, `raise NotImplementedError` then `A` basically says "Yeah I'm not *really* a `B`".

Sometimes the problem can be solved by realizing that in your initial writing of the abstract class you added too much concrete code; code that should better be put into the child classes that actually use it. But sometimes there just isn't a good abstraction. In that case, don't use inheritance. You can still avoid code duplication using other techniques, such as composition (next chapter!).

## Honor the Contract

A subclass does not just inherit the public interface of its superclass. It also inherits the *expected behavior* of such an interface. In a proper class hierarchy, a subclass promises to be *substitutable* for its superclass. If `A` inherits from `B`, then any method that thinks it's working with a `B` should do just fine working with an `A`. Think about what would happen if a subclass *wasn't* substitutable. Then every bit of code that works with class `B` now has to explicitly check whether you *actually* gave it a `B` or snuck in an `A` instead, and we're back at being tightly coupled to classes, when the whole point of using inheritance in the first place was to avoid explicit type checks.

Recall the Liskov substitution principle. A subclass and its methods *may* accept broader inputs than the superclass, because then it will *definitely* accept the inputs that are valid for the superclass. And it *may* return narrower results than the superclass, because then its results will *definitely* be valid results of the superclass. That way, there can be no nasty surprises. Here is an example:

Let's say we have a class doing some math work on numbers, with a superclass having methods that accept and return integers, both positive and negative. With the principle above in mind, then, we could think of subclasses working with different numbers:

- A subclass's methods could accept floats as well as integers.
- A subclass's methods might only return *positive* integers.

But here are some *invalid* examples:

- A subclass must not *refuse* to accept negative integers!
- The subclass cannot *return* floating point numbers!

If a subclass did either of those two things, it could not be substituted for the superclass.

But *honoring the contract* goes further than just making sure that the types of arguments and return values match. It really means: Make sure nobody who is working with your class hierarchy has to ever explicitly check which particular subclass you passed. To quote the author:

> An object should act like it claims to be

I'll leave with this counter-example:

```python
class BlackHole(list):
    def append(self, x):
        pass
```

This class claims that it *is a* list, but definitely doesn't behave like one...

## Use the Template Method Pattern

We talked about this at length in the previous chapter. This is the best pattern for writing code that is readily inheritable. It forces you to think carefully about what's abstract and what's concrete. The abstract part is the "general algorithm" and the concrete part are the specializations.

In this case, it also helps to make explicit which methods are meant to be overridden (the template methods) and which methods are part of the "stable" abstract algorithm. In some languages, you can use a keyword such as `final` to prevent a method from ever being overridden by a subclass, but in Python we can only use comments. (There is a proposal to add such a `final` qualifier to Python's type hints, but remember that type hints have no effect on the running of the Python program; they're merely annotations and comments for the programmer and some external tools.)

## Preemptively Decouple Classes

If at all possible, avoid writing code that *forces* an overriding method to call `super()`. This would lead to strong coupling between the super- and subclass. As we have seen in the last chapter, hook methods are the way to go here: They keep the superclass in control of the algorithm, and absolve the subclasses from having to know about when and how to call the super-version.

One exception to this, I would say, is the `__init__` method. In some languages, when you create an instance of a subclass, the constructor of the superclass gets called automatically. This is not the case in Python, and so it's a very common occurrence that your subclass's `__init__` calls `super().__init__()`, although you could also consider using a `post_init()` hook method.

One note about hook methods, though: They only work in *shallow* hierarchies, one level deep. If you go deeper, you might have to call `super()` after all. This leads us to the next point:

## Create Shallow Hierarchies

A class hierarchy can be shallow or deep, and it can be narrow or wide. The ideal hierarchy, from the point of readability and understandability, is of course shallow and narrow: Only a few child classes, and only one level deep.

The worst hierarchies are deep and wide. They are too complex to understand and often too rigid in their design. Avoid those!

What's still okay are shallow and wide hierarchies. It just means that your one base class has many useful specializations. It should still be relatively easy to reason about such a hierarchy.

What's not so okay are deep and narrow hierarchies. According to the author, there's two issues with them. First, over time they grow wider anyway as we add new classes here and there at different levels of the hierarchy. Second, most people only understand the ends of the hierarchy: The classes at the top and the classes at the bottom, with lots of mystery and confusion in the middle.

# Summary

The first thing to check with mixins / modules is whether they *actually* represent a *role* that an object might play. The coding techniques to make mixins and modules successful are the same patterns that make classical inheritance successful. And when an object acquires behavior via inheritance, it should honor the contract implied by that relationship.
