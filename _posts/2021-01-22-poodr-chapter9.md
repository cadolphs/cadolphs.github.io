---
layout: post
title: Practical Object Oriented Design - Book Notes - Chapter 9
categories: [development]
---
This is the ninth part in my review and reading notes on the Practical Object Oriented Programming book ([www.poodr.com](http://www.poodr.com)) by Sandi Metz.

I think in this chapter, due to important differences between Python on Ruby, I will deviate the most in following along with the author.

The chapter begins with a great review of the three pillars of good, well-designed, changeable code.

You must:

- Understand object-oriented design, so your code is capable of accommodating future change.
- Be skilled a *refactoring*, so you can successfully carry out those future changes.
- Write **high-value** tests, so that you can refactor constantly without fear.

# Intentional Testing

A quick recap on why we test. The reasons range from the concrete to the subtle:

- Of course we test to reduce bugs.
- But also to provide documentation: This is how you use this class and what its contract is.
- Writing tests first to *improve* design. A test is just another piece of code that collaborates with your class!

This all comes down to one overarching goal: Reduce cost! If it was easier and cheaper to just wait for bugs to show up and then find their true source and fix them, then writing unit tests would be a waste of time (and money).

Invest time in good tests and hopefully get that time back via easier refactoring, better design, fewer bugs.

Here then is a dilemma of the testing novice: Writing tests costs more time than it saves, until you get good ad writing tests! This is a bit like teaching someone to type with all their fingers when, all their life, they've been a happy two-finger-seek-and-peck typer. Some people get quite fast at two-finger typing. Changing to using more fingers will initially feel awkward to them, and will in fact slow them down.

So here the author follows with a great discussion of what, when, how to test.

## Knowing your intentions

Benefits of testing:

### Finding Bugs

Obviously the earlier the better!

### Supplying Documentation

Tests are a reliable documentation of design! Comments and API documentation can easily become obsolete. Tests (that are run and pass, of course) must stay true to the design!

Having worked on a few larger projects myself by now, I cannot overstate how true this is. So many times I have looked at the docstring of a method or class only to discover that it is woefully out of date, referring to parameters that are not being passed in anymore, and omitting those that are.

Instead, a proper test cannot lie: If you change the way a method is called, the test of that method must change with it!

### Deferring Design Decisions

As explained earlier in the book, you should not make premature "just in case" design decisions. One example was: Don't create some class inheritance hierarchy with an abstract base class until you have *at least three* concrete examples for their subclasses! If you start off your design with just one concrete class, just leave it concrete. Don't be a premature taxonomist. But: Write a proper test for the interface of your concrete class, so that, when the time comes, refactoring to a class hierarchy will not break the behavior of the concrete class.

Basically, deferring a design decisions means acknowledging that the current design is probably not the best final design, but that more information is required to pick the *correct* final (well, final until even more new information comes, anyway) design. With that in mind, you are then fully aware that there's a good chance you'll want to *refactor* your code in the near future. And with *that* in mind, you'll of course want the right type of test in place that will allow you to refactor without thinking about "what if my refactoring accidentally breaks what already worked?"

### Supporting Abstractions

A quote from the author:

> Good design naturally progresses toward small independent objects that rely on abstractions.

The individual abstract classes might then be easy to understand, but *how they're supposed to all fit together* might not be immediately obvious. Tests can help with that, and ensure that classes that play certain roles do so correctly.

### Exposing Design Flaws

As said above, a test is just another piece of code that wants to use your classes and collaborate with them. That means: If your design is bad, testing will be hard! A number of concrete examples of this:

- If setup is annoying and painful, your objects require too much context.
- If you cannot effectively test one object in isolation but rather have to pull in a bunch of other objects into the test, your code has too many dependencies.
- If the test is hard to write, the object under test might be hard to reuse.

So much for the *reasons* to test. Next up is a great discussion of *what* you should be testing.

### Knowing what to test

A reminder to what our goal is: We want to get all the benefits from testing at the lowest cost possible! How?

> Write *loosely coupled tests* about *only what matters*.

It is important that tests are *loosely coupled*, because otherwise they become hard and expensive to maintain. There's also the concept of *brittle* tests: Tests that start failing and need to be changed for *bad* reasons; reasons that the *rest* of your application doesn't even care about.

A few rules follow:

- Test *everything*, but *just once*, and *in the right place*.
- See objects as purely defined by the *messages* going into and coming out of them. Treat the rest of the class as a black box (ideally, at least; there are some justifiable exceptions).
- See a test as just another piece of code that wants to collaborate with your class!
- Apply the same general design principles that apply to application code to the test code!
- Tests should concentrate on incoming and outgoing messages.

That last part deserves some elaboration. The *incoming* messages are what forms the class's public interface. Some instigating object sends the messages and gets some answer in return. It is our job to test that the message returns the right thing, or otherwise has the right *effect*. The author calls these tests "tests of *state*".

This is also a great opportunity to talk about command/query separation. In the spirit of clean code and having one method do exactly one thing, it is considered good style to have a method *either* compute and return something or *do* something (e.g. set some field to something or kick off any other sort of side-effect). So then for a query, we check that the return value is correct, and for a command we will have to figure out how to check the desired side-effect.

If you follow these rules, your tests will have the *smallest possible coupling* to the classes they are testing. These tests will have to change for only two reasons:

- Changes to the public interface of the class.
- Changes to the expected behavior of the class.  
    Those are *good* reasons to change. In the first case, obviously we have to change a test if we, say, rename a method. In the second case, we again have a good reason to change the test: The current version of the test checks for the correct current behavior of the class. If we want to *change* that behavior, the tests need to be changed to check that.

### Knowing when to test

> You should write tests first, whenever it makes sense to do so.

Nice quote from the author. There is a whole school of thought around TDD (Test-Driven Design) that emphasizes that a test should be written *before* the code it's meant to test. This does not always make sense, according to the author, and in my own experience I tend to agree. I would argue that tests are great for exploring and guiding towards good design, but are *not* meant as a tool for algorithm development: If you don't even know *what* you're trying to implement, tests won't necessarily get you there. If you disagree, I challenge you to use pure TDD to write a fast solver for an NP-hard problem of your choice.

Another issue is that, when writing tests first, you already need to have good design sense to write the type of test that will then lead to good design. As the author puts it:

- Novices often write the most complex, coupled code
- That makes tests super-hard to write retroactively!
- So then if the novice forces themselves to write the test first and *persevere*, at least the code will be *somewhat* reusable.
- It doesn't save you from bad design, though! It is perfectly possible to use TDD and still arrive at strongly coupled code!

Persevere! When it comes to design, *write tests first*, but do so *while applying the principles of good design*.

And if you are not writing tests as the *very* first thing, still treat them with more respect than a mere afterthought!

### Knowing how to test

We discuseed what and when to test, so now comes a quick overview on *how* to test. First some logistics:

First, pick a mainstream framework that suits your needs (for Python, I *really* enjoy pytest). Just pick something reasonably stable and well-maintained.

Next, consider which style of testing to use. There are two *extremes*: You can test outside-in and inside-out. With inside-out, you would first write tests for, and then implement, the low-level building blocks of your application, and then once those are in place, piece by piece, assemble them into the larger application.

With outside-in, you would first write tests for the high-level abstract concepts, specifying the general behavior you want to see from them and mocking or stubbing out the rest, and then slowly work your way down to the lower level objects.

In ["The Pragmatic Programmer"](https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/) the authors give a different view. They assert that both of the extreme approaches have flaws. With inside-out, you can spend a lot of time creating neat little classes that you *think* will be the right sort of building blocks, only to discover much later that they don't quite fit the purpose. With outside-in, you assume that you can identify the correct abstractions and high-level concepts right away, and there is a very real danger that you engage in some *premature abstraction*. The authors suggest, rather, to pick very small slices of functionality and develop them *end-to-end*. This has two effects: The choice of whether to go inside-out or outside-in matters much less, because much fewer moving pieces are involved. And feedback about what the right low-level components and the right high-level abstractions are arrives much sooner.

Next, some terminology. We'll be talking about the *object under test* versus *everything else*. In testing, we aim that our tests are as ignorant as possible about the *everything else* part. The less a `test_class_A` needs about classes B through Z, the better!

And, finally, the tests should be as loosely coupled to the object under test as possible, which, as mentioned above, means ideally they should *only* depend on the public interface of the object under test, and *not* its internal fields and private methods!

Now it might be that for some complex algorithmic problems you do want to check some intermediate results that are stored in private fields. Just remember that, in any case, we want our tests coupled to *stable* things rather than less stable things!

# Testing incoming messages

The object under test has a public interface. These are the *incoming messages*, and of course we need to test that they "do the right thing".

Assuming that the object under test already exists and you're adding tests after the fact, the first thing to check is whether anyone else actually ever calls a given method. If not, just go ahead and delete it.

## Getters and Setters

Next, don't bother writing sets for *simple* getters and setters. First of all, if they really are just very basic getters/setters then at least in Python you should just remove them and make the corresponding attribute public. And at that point, we don't need a test that `my_class.foo = 42` actually assigns 42 to `foo`.

If, however, you have introduced more complicated logic via the `@property` decorator, you should of course test that it behaves correctly. A small, silly example:

```python
class Circle:
    def __init__(self, radius):
        self.radius = radius
        
    @property
    def radius(self):
        return self._diameter / 2
    
    @radius.setter
    def radius(self, value):
        self._diameter = 2 * value
```

This is of course still pretty simple logic. Just pretend that it was actually complicated, okay? Now a *brittle* test, that would be *strongly coupled*, would try and make some assertions about `_diameter`. But remember: Rely on the public interface only if at all possible. The test itself is actually quite simple, but we need it because the internal behavior is complex:

```python
def test_circle_sets_radius_correctly():
    circle = Circle(radius = 5)
    
    assert circle.radius == 5
    
    circle.radius = 42.5
    assert circle.radius == 42.5
```

And who knows, we might even get a failing test due to floating point inaccuracies...

## Testing simple methods

Next in line are simple methods that return a result but have no further dependencies to get their job done. That is, the only object involved in handling the incoming message is the object under test. In that case, just consider what the expectation of that method is and write the appropriate tests. Don't forget edge cases! Consider parametrizing your tests to check multiple inputs, or, going even further, use a hypothesis-testing module (`hypothesis` works really well with pytest) to automatically have a bunch of possible inputs tested.

And don't forget to test that exceptions get raised as they should. To keep the cost of testing reasonable, I would not suggest testing that any sort of intentional garbage input leads to errors: Yes, a function that clearly needs to operate on numbers will raise all sorts of `TypeError` exceptions if you put something else in. This is already handled by the programming language itself.

Instead, we should test those exceptions that our object under test explicitly raises to signal certain out-of-the-ordinary circumstances!

## Testing more complicated methods

"More complicated" here means that the method under test in turn sends messages to other objects to achieve a desired end result. Why does that make it more complicated? If we recall the advice about treating the object under test as a black box and only relying on its public interface, we should be able to test if the method under test returns the correct result, whether that method relies on other objects.

However, this sort of test might violate the *test everything only once* idea: If a method of object `A` relies on object `B`, then testing that method indirectly also tests object `B`, which means we have duplicated the effort. Ideally we would want to separate those tests such that in the tests for `A` we make sure that the part that `A` is responsible for is handled correctly, without including a check on `B`.

Such coupled tests might be slow to run (if creating instances of `B` or running its methods is costly) and might break in unexpected ways due to the coupling.

The next section discusses ways to achieve better isolation:

## Isolating the object under test

If we truly want to test everything only once, we must design objects such that we can *isolate* them when under test!

Recall our simple job helper example

```python
class A:
    def do_some_work(self, arg):
        intermediate_result = B().process(arg)
        return self._process_further(intermediate_result)
```

In this case, testing `do_some_work` inevitably pulls in object `B` into the mix, violating our goal of testing everything only once. What if `B().process(arg)` takes a really long time?

As we already discussed (in the notes to chapter 3), we have here a case where class `A` depends on class `B` when really it should depend on *some* object playing the *role* of a processor. We'd refactor this code to use dependency injection:

```python
class A:
    def __init__(self, job_helper):
        self._job_helper = job_helper
    
    def do_some_work(self, arg):
        intermediate_result = self.job_helper.process(arg)
        return self._process_further(intermediate_result)
```

For now, with this refactoring, the test would then inject an instance of `B`:

```python
def test_do_some_work():
    a = A(job_helper = B())
    result = a.do_some_work(arg=42)
    
    assert result == "whatever we expected"
```

So right now we have reduced the coupling of class `A` to explicit class names, but we haven't quite yet solved the problem of the test of `A` also relying on class `B`.

Sandi Metz reminds us here that the injected class plays a *role*. There could just as well be *other* objects playing that role. Why should `B` get to play the role of `job_helper` and not some other class that implements `process(arg)`? What if we have *lots* of classes that could play this role? Or what if creating those classes or running their methods was extremely costly, or had some annoying side-effects (like having to talk to some external web-server or writing a big file to disk?). Read on to find out.

## Injecting dependencies as roles

First: Before overthinking, over-engineering and over-abstracting things, consider whether creating and injecting the concrete class (in our case class `B`) is okay after all. If it is fast and cost-effective and mirrors how it should be done in the actual application, then this is fine! For example, that class might be a lightweight utility class that groups a few useful things together; creating it and running it is fast, and it's the *only* class playing the `job_helper` role in your application.

However, if that's not the case, here are some advanced techniques for isolation:

### Creating test doubles

- Let's assume the concrete classes we'd use for dependency injection are costly to create, or costly to run, or there's so many of them that it's not clear which one we should use.
- In that case, you can create *yet another class* that plays the appropriate role, but with a very simple ("stub") implementation. Call these `Dummy` or `Double`.  
    In our example, this could look like this:

```python
class JobHelperDummy:
    def process(self, arg):
        return 11 # stub result; super-fast to execute and always reliable

def test_do_some_work():
    a = A(job_helper=JobHelperDummy())
    
    result = a.do_some_work(arg=42)
    
    assert result = "whatever the result would be if the intermediate result was 11"
```

Of course we can add a bit more sophistication into this example; maybe the dummy-result that we've hard-coded to 11 could be a parameter that we get to pass into the class.

One note: Some people would call `JobHelperDummy` a mock object. This is not accurate. We'll discuss mocks in a coming chapter. The reason for this occasional confusion is that tools used for creating mocks are also quite useful in creating doubles. Though as we have shown here, you can always just create a test double (or dummy) by hand.

Is now all good and well? Not quite! The author points out an important pitfall. Let's say we decide to refactor class `B` and rename the `process` method to something else, like `super_awesome_process`. But let's say we forget to update class `A`, and have it still try to call `job_helper.process`. That means our *application* is broken. What about our tests? They still pass! `A` tries to call `process`, and the `JobHelperDummy` that we pas into `A` dutifully implements `process`, so in test-world, all is fine!

The lesson here is: If a concrete object should play a given role (i.e. implement a given duck type), there should be tests that break if the object doesn't properly play the role! That includes test doubles! More on *how* to do that later in the chapter.

# Testing private methods

Another great example of being practical: In an idealized world, you'd never test private methods, because they'll never be called from the outside. They would be *indirectly* tested by the tests of those public methods that in turn invoke the private method. But we're not always in this ideal world. Let's see what our options are.

## Ignoring private methods during testing

Private methods are used as helpers and internal implementation details of the public methods. Thus, tests of the public methods will already be testing the private methods indirectly. Explicitly testing a private method might thus lead to unstable tests, because these private methods can change around more than the public interface.

Another caveat: If you expose these private methods in your tests and basically show their "example usage", others might be tempted to use them as well.

## Removing private methods from the object under test

Now here is an easy way out: If your object has *no* private methods, you don't need to fret over whether or not to test them... In any case, if your object has *too many* private methods, maybe that object is doing too much! Could / should it be broken up into several smaller classes? And these smaller service classes would then have public methods instead of private methods.

That however only makes sense if those new classes with their newly public methods will actually have a *stable* interface. As the author points out, a method doesn't suddenly become more stable just because you made it public instead of private.

Another thought is that this aversion to private methods might run counter to the clean code design principle of writing small functions. The public method would be the class's entry point to achieve a desired behavior and in turn achieve that by calling appropriate lower level private methods.

## Choosing to test a private method

So when is it ever okay to *actually* test a private method? The author gives one example, and I'd like to give another.

The author discusses testing private methods in the context of *starting* with some complicated tangled mess that is the result of a lack of information: We don't know yet what the good design will look like. A good idea then is to *hide* that mess in private methods and add *tests* to them so that we can then refactor with confidence toward a better design.

Another example where I believe testing a private method is justified concerns a *stable* sub-routine of some complex algorithm where it wouldn't make sense to publicly expose that sub-routine yet we still want a sufficiently fine-grained (i.e. beyond the public interface of the overall algorithm) test to make sure all the individual pieces of the algorithm work as intended. It might also be that certain edge cases that we want to test are hard to bring about via the input to the public method.

# Testing outgoing messages

In a well-designed application, an outgoing message should be *either* a query *or* a command. A query is a method that returns some result without any side-effects. A command is a method that does not return anything but kicks of certain side-effects.

That means the object under test will send outgoing messages either to receive some information or to tell someone else in the system to do something.

The important thing to note is: A query matters only to the sender. Because the query has no side-effects, whether or not it was called has no effect on the system. A command, on the other hand, might have an effect that matters to the rest of the system.

So what do we test here, and how?

## Ignore outgoing queries

Consider this example again:

```python
class A:
    def __init__(self, job_helper):
        self.job_helper = job_helper
        
    def process_input(self, data):
        intermediate_result = self.job_helper.process(data)
        self.do_some_more_processing(intermediate_result)
```

In this case, `process` is an *outgoing* message, sent by class `A` to some other class. On top of that, it is a *query*. We're asking the job helper to give us the answer to some input question, and then internally use that intermediate result. In this case, the test suite for class `A` should not do anything at all about the outgoing `process` message.

Instead, the test suite for whichever class plays the `job_helper` role will be testing that `process` behaves as intended, because for *that* class it will be an *incoming* message.

## Proving command messages

If it matters *to the rest of the application* that your object *sends* a specific method, then this expectation on the behavior needs to be tested as well.

The emphasis, here, is on *rest of the application*. If the command is merely sent to some internal auxiliary class in a way that is hidden from the rest of the application, that whole block of interactions can be treated as just one big query: Maybe in our example above the `job_helper` needs a bit of extra setup before we can ask it to process our data. This might be done via commands that change the internal state of the job helper, but we assume that the rest of the application does not care about that. We would just treat that whole block of messages as one big query (albeit with side-effects.)

The book example does a great job here with the observer pattern. The object under test now has a *responsibility* to send out a specific method to a specific target, and we need a test that proves that. The solution here are *mocks*. These are *special* test double objects that record what messages they have received, and with what arguments, and then allow us to make assertions about that. In Python, you can find them in the `unittest.mock` module.

```python
from unittest.mock import Mock

def test_that_do_something_calls_job_helper_process():
    job_helper = Mock()
    object_under_test = A(job_helper=job_helper)

    object_under_test.do_something()
    
    job_helper.process.assert_called_with(42)
```

For this technique to work *smoothly*, it is important that your application is well-designed, making proper use of dependency injection. In the above example, if `job_helper` was some explicit instance of some class `B`, and wasn't injected from the outside into class `A`, we would have to *monkey patch* the `job_helper` instance inside class `A`. This *couples* or test to the internal structure of the class, and this is what sometimes gives mocking a reputation for leading to *brittle* tests.

# Testing Duck Types

- Consider a duck type that's defined solely by its interface
- It would make sense to include a *test* for every class that plays the role of that duck type to make sure it *honors* that interface
- We *can* of course achieve that by having them all inherit from the same abstract base class, but let's say we want to keep the duck type simple
- Then we basically need to test that all these classes *respond* to the messages that the ducktype responds to
- Ideally we achieve that *without* duplicating this code all the time.

For Ruby, the author gives the example of doing that with modules. Here is how the analogue could work in python:

```python
class A:
    def foo(self):
        return 42
    
    def bar(self):
        return 55
```

Let's say `foo` is a message that belongs to some duck type `Fooable`. We can then write  
the following mixin class:

```python
import pytest
class FooableDuckTypeTestMixin:
    @pytest.fixture
    def instance(self):
        return self.object_under_test()
    
    def test_implements_foo_ducktype(self, instance):
        assert hasattr(instance, "foo") and callable(getattr(instance, "foo"))
```

And then in the test file (using pytest) we would have:

```python
from class_a import A

class TestClassA(FooDuckTypeTestMixin):
    object_under_test = A
    
    def test_bar():
        assert A().bar() == 55
```

Things will look differently if you use a different test suite (e.g. `nose` or just plain old `unittest`). In pytest, the test class is merely for grouping functions and does *not* take care of test setup. Instead of setup methods, pytest allows methods or functions be declared as fixtures. Here we turn `instance` into a fixture with class-wide scope. Then every function inside that class with an argument named `instance` will automatically receive, via pytest, whatever the `def instance(self)` method returns. In this case, it's an instance of the class under test.

If we now add another class `B` that *also* implements the `Foo` ducktype, we also just add the duck-type test mixin to its test class, this time of course setting `object_under_test = B`.

## Using role tests to validate doubles

Earlier in the chapter it was discussed that using test doubles might lead to *brittle* tests when the test double plays the role of a duck type and then the duck type changes. In this case, the application would break without the tests catching that!

The solution presented by the author here is to then just use the test module / mixin for the test double as well!

### Side note: Python

In Python, since we have the option to use multiple inheritance, we *could* solve this problem (of objects not playing their roles correctly) by using abstract base classes (ABCs). Those would then *automatically* ensure that their subclasses implement the  
correct interface.

However, this can lead to a lot of noise and boilerplate code. Remember from the duck type chapter that Python has a number of *protocols*, like the sequence protocol, that means anything that implements `__len__` and `__getitem__` is considered a sequence (provided `__getitem__` works with integers from 0 to `len - 1`).

Python has a cool feature though: You can override the standard way that a class checks if another class is a subclass of it. Here is how that would look like for our foo-example:

```python
from abc import ABC, abstractmethod
class FooDuckType(ABC):
    @abstractmethod
    def foo(self):
        """Some docstring explaining what foo should do in subclasses"""
        
    @classmethod
    def __subclasshook__(cls, subclass):
        if cls is FooDuckType:
            if hasattr(instance, "foo") and callable(getattr(instance, "foo")):
                return True
        return NotImplemented
```

What this achieves is that `isinstance(some_class, FooDuckType)` doesn't check if  
`some_class` *explicitly* inherits from `FooDuckType`. Instead, it runs the checks  
in `__subclasshook__`. What this means in our case is that any class that implements `foo` will be considered a subclass of `FooDuckType`.

You have to carefully evaluate whether all this extra code and type checking is necessary and helpful. We are, after all, writing in a dynamic language! To quote Sandi Metz:

> Having to write your own role tests is the price you pay for the benefits of dynamic typing. In statically typed languages you can lean on the complier to enforce the interfaces of roles, but in dynamically typed languages, roles are virtual. If you fear that human communication will be insufficient to keep all players of a role in sync, write these tests.

So it is a judgement call. For simple duck types, this might indeed by overkill! And for more complex types, using the abstract base class mechanism instead might be the way to go!

# Testing inherited code

I believe this chapter does not quite apply as much to Python as it would to Ruby. The author describes in this chapter that, with an inheritance hierarchy, we should include a number of tests and share them via the module mechanics:

- Write a module to be included in each subclass's tests that ensures that the subclasses honor the interface of the superclass
- Write a module to be included in each subclass's tests that ensures that the subclasses "respond" to the hook methods that they're required to implement.

I feel that these tests are not needed in Python. By inheriting from a superclass, we get the automatic delegation and thus of course our subclasses respond to all the messages of the superclass, unless we dome some *really* weird meta-programming. In addition, python has the `@abstractmethod` decorator that forces subclasses to provide implementations for methods decorated with it.

What I am wondering: If we omit these explicit interface tests, what is the worst that could happen? Does it hinder future attempts at refactoring? Would it lead to unexpected breakages in our code? I do not think so!

So what *do* we test, and how, in inheritance? It all comes down to the incoming and outgoing messages again!

For the subclasses, remember that they are meant to provide *specializations*. The hook methods represent incoming messages and as such deserve to be tested to make sure they deliver the \_correct \_specialization.

For the superclass abstractions, we want to make sure that the hook methods get appropriately incorporated into the superclass's behavior. We achieve that by using a test double again: A simple dummy class inherits from the abstract superclass and fills in the missing pieces with simple-to-test stub methods.

# Summary

Hopefully this writeup made it clear *what*, *when*, and *how* we should test. Such tests are invaluable for an application and become more important the more abstract concepts there are in your code. Without such tests, the application will be too hard to change and understand!

# Overall Summary

This post concludes the review and book notes. I can highly recommend grabbing a copy of the book for anyone programming in a dynamically typed language, be it Ruby, Python, or something else entirely. The concepts and ideas will apply, with minor modifications, across the board.
