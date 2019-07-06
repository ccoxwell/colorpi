#!/usr/bin/env python
import RPi.GPIO as GPIO
import time
import sys
import logging
import os


logging.basicConfig(filename="rgb.log")

logging.debug("running")

R = 11
G = 13
B = 15

# r_value = int(sys.argv[1])
# g_value = int(sys.argv[2])
# b_value = int(sys.argv[3])

def setup(Rpin, Gpin, Bpin):
	global pins
	global p_R, p_G, p_B
	pins = {'pin_R': Rpin, 'pin_G': Gpin, 'pin_B': Bpin}
	GPIO.setmode(GPIO.BOARD)       # Numbers GPIOs by physical location
	for i in pins:
		GPIO.setup(pins[i], GPIO.OUT)   # Set pins' mode is output
		GPIO.output(pins[i], GPIO.HIGH) # Set pins to high(+3.3V) to off led
	
	p_R = GPIO.PWM(pins['pin_R'], 2000)  # set Frequece to 2KHz
	p_G = GPIO.PWM(pins['pin_G'], 1999)
	p_B = GPIO.PWM(pins['pin_B'], 5000)
	
	p_R.start(100)      # Initial duty Cycle = 0(leds off)
	p_G.start(100)
	p_B.start(100)

def map(x, in_min, in_max, out_min, out_max):
	return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min

def off():
	for i in pins:
		GPIO.output(pins[i], GPIO.HIGH)    # Turn off all leds

def setColor(r_value, g_value, b_value):   # For example : col = 0x112233
	R_val = map(r_value, 0, 255, 0, 100)
	G_val = map(g_value, 0, 255, 0, 100)
	B_val = map(b_value, 0, 255, 0, 100)

	logging.debug("R_val ")
	logging.debug(R_val)
	logging.debug("G_val ")
	logging.debug(G_val)
	logging.debug("B_val ")
	logging.debug(B_val)
	
	p_R.ChangeDutyCycle(R_val)     # Change duty cycle
	p_G.ChangeDutyCycle(G_val)
	p_B.ChangeDutyCycle(B_val)

def loop(r_value, g_value, b_value):
	while True:
		setColor(r_value, g_value, b_value)

def destroy():
	logging.debug("end it")
	p_R.stop()
	p_G.stop()
	p_B.stop()
	off()
	GPIO.cleanup()

def main(r_value, g_value, b_value):
	print("the pid of rgbexp.py is " + str(os.getpid()))
	f = open("pid", "w")
	f.write(str(os.getpid()))
	f.close()
	try:
		setup(R, G, B)
		loop(r_value, g_value, b_value)
	except KeyboardInterrupt:
		destroy()

if __name__ == "__main__":
	main(r_value, g_value, b_value)	
