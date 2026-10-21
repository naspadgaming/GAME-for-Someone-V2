
from ursina import *
from ursina.prefabs.first_person_controller import FirstPersonController
import random
import json

from game.blocks import BLOCK_TYPES
from game import state
from game.voxel import Voxel
from game.world import ChunkManager

app = Ursina()

# chunked world manager (loads/unloads chunks around player)
manager = ChunkManager(chunk_size=16, render_radius=2)


def save_world(path='world.json'):
	positions = []
	for e in scene.entities:
		if isinstance(e, Voxel):
			# store as [x,y,z,type]
			positions.append([int(e.x), int(e.y), int(e.z), int(getattr(e, 'btype', 0))])
	with open(path, 'w') as f:
		json.dump(positions, f)
	print(f'World saved ({len(positions)} blocks) -> {path}')


def load_world(path='world.json'):
	try:
		with open(path, 'r') as f:
			positions = json.load(f)
	except Exception as e:
		print('Failed to load world:', e)
		return

	# remove existing voxels
	for e in list(scene.entities):
		if isinstance(e, Voxel):
			destroy(e)

	for p in positions:
		# support both [x,y,z] and [x,y,z,type]
		if len(p) >= 4:
			x,y,z,t = p[0],p[1],p[2],p[3]
			Voxel(position=(x,y,z), btype=t)
		else:
			Voxel(position=(p[0],p[1],p[2]), btype=0)
	print(f'World loaded ({len(positions)} blocks) <- {path}')

def input(key):
	# global input handler: K to save, L to load, Q/E to change block
	if key == 'k':
		save_world(file_input.text.strip() or 'world.json')
	if key == 'l':
		load_world(file_input.text.strip() or 'world.json')
	if key == 'q':
		state.current_block = (state.current_block - 1) % len(BLOCK_TYPES)
		update_block_ui()
	if key == 'e':
		state.current_block = (state.current_block + 1) % len(BLOCK_TYPES)
		update_block_ui()


window.borderless = False
window.title = 'Minecraft-like Prototype (Ursina)'

player = FirstPersonController()

# UI: filename input + save/load buttons + notification
file_input = InputField(default='world.json', scale=0.06, position=Vec3(-0.6, 0.42, 0))

def show_message(txt, duration=2):
	msg = Text(text=txt, origin=(0,0), y=0.35, scale=2, background=True)
	invoke(destroy, msg, delay=duration)

def on_save():
	path = file_input.text.strip() or 'world.json'
	save_world(path)
	show_message('Saved: ' + path)

def on_load():
	path = file_input.text.strip() or 'world.json'
	load_world(path)
	show_message('Loaded: ' + path)

save_button = Button(text='Save', color=color.azure, scale=(0.09,0.05), position=Vec3(-0.2,0.42,0), on_click=on_save)
load_button = Button(text='Load', color=color.lime, scale=(0.09,0.05), position=Vec3(-0.08,0.42,0), on_click=on_load)

# block UI (preview + name)
block_preview = Button(text='', color=BLOCK_TYPES[state.current_block]['color'], scale=(0.05,0.05), position=Vec3(0.12,0.42,0))
block_label = Text(text=BLOCK_TYPES[state.current_block]['name'], position=Vec3(0.18,0.42,0), origin=(0,0))

def update_block_ui():
	block_preview.color = BLOCK_TYPES[state.current_block]['color']
	block_label.text = BLOCK_TYPES[state.current_block]['name']

update_block_ui()


def update():
	# called each frame by Ursina
	manager.update(player.position)

app.run()
