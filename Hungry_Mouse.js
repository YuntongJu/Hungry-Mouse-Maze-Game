import { defs, tiny } from './examples/common.js';
import { Color_Phong_Shader, Shadow_Textured_Phong_Shader, LIGHT_DEPTH_TEX_SIZE } from './examples/shadow-demo-shaders.js';
import { Shape_From_File } from './examples/obj-file-demo.js';
import { Text_Line } from './examples/text-demo.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const { Cube, Axis_Arrows, Textured_Phong } = defs

export class Hungry_Mouse extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        /* Player initial coordinates */
        this.x_movement = 0;
        this.z_movement = 10;
        this.player_angle_of_view = 0
        this.udSpeed = 0;
        this.rotation_magnitude = 0;
        this.leeway = 0.75;
        this.cheese_count = 0;
        this.silverKey = false;
        this.goldenKey = false;
        this.title_screen = true;
        this.mapwidth = 15;
        const map = this.map = [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]
        this.cheese_position = []

        this.collision_with_leftwall = false;
        this.collision_with_rightwall = false;
        this.collision_with_topwall = false;
        this.collision_with_bottomwall = false;
        //this.initial_camera_location = Mat4.look_at(vec3(this.x_movement, 1.5,  this.z_movement), vec3(this.x_movement, 1.5,  this.z_movement+5), vec3(0, 1, 0));

        //set initial camera view

        this.shapes = {
            //basic shapes
            box: new defs.Cube(),
            sphere: new defs.Subdivision_Sphere(4),
            circle: new defs.Regular_2D_Polygon(50, 50),
            square: new defs.Square(),
            torus: new defs.Torus(15, 15),
            torus2: new defs.Torus(3, 15),
            //Wall
            wall: new defs.Cube(),
            door: new defs.Cube(),
            cheese: new Shape_From_File("assets/cheese2yuan.obj"),
            key: new Shape_From_File("assets/key.obj"),
            text_line: new Text_Line(100)
        };
        //this.shapes.sphere.arrays.texture_coord = this.shapes.sphere.arrays.texture_coord.map(x => x.times(2));
        this.shapes.wall.arrays.texture_coord = this.shapes.wall.arrays.texture_coord.map(x => x.times(2));
        this.shapes.square.arrays.texture_coord = this.shapes.square.arrays.texture_coord.map(x => x.times(100));

        // *** Materials
        this.materials = {

            sky: new Material(new Textured_Phong(),
                {
                    ambient: 1, diffusivity: 0, color: hex_color("#001a1a"),
                    texture: new Texture("assets/collagedsky.png", "LINEAR_MIPMAP_LINEAR")
                }),
            cheese: new Material(new defs.Fake_Bump_Map(1), {
                ambient: 1, diffusivity: 0.3,
                color: hex_color("#562c03"),
                texture: new Texture("assets/texture.jpg", "LINEAR_MIPMAP_LINEAR")
            }),
            silverkey: new Material(new defs.Phong_Shader(1), {
                ambient: 1, diffusivity: 1, specularity: 1,
                color: hex_color("#9d9d9d"),
            }),
            goldenkey: new Material(new defs.Phong_Shader(1), {
                ambient: 1, diffusivity: 1, specularity: 1,
                color: hex_color("#d38f00"),
            }),
            wall: new Material(new defs.Fake_Bump_Map(1), {
                ambient: 1, diffusivity: 0.5, specularity: 0.5,
                color: hex_color("#050505"),
                texture: new Texture("assets/stonewall3.0.jpg", "LINEAR_MIPMAP_LINEAR")
            }),
            floor: new Material(new defs.Fake_Bump_Map(1), {
                ambient: 1, diffusivity: 0.5, specularity: 0.5,
                color: hex_color("#121218"),
                texture: new Texture("assets/dungeon_wall.jpg", "LINEAR_MIPMAP_LINEAR")
            }),
            map_floor: new Material(new defs.Phong_Shader(1),
                { ambient: 1, color: hex_color("#637e5b") }),
            map_wall: new Material(new defs.Phong_Shader(1),
                { ambient: 1, color: hex_color("#6c1f01") }),
            point: new Material(new Textured_Phong(),
                { ambient: 1, color: hex_color("#31fd04") }),
            text_image: new Material(new defs.Textured_Phong(), {
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/text.png")
            }),
            door: new Material(new defs.Fake_Bump_Map(1), {
                ambient: 1, diffusivity: 0.5, specularity: 0.5,
                color: hex_color("#3f1600"),
                texture: new Texture("assets/wood_door.png", "LINEAR_MIPMAP_LINEAR")
            }),
            exit: new Material(new defs.Fake_Bump_Map(1), {
                ambient: 1, diffusivity: 0.5, specularity: 0.5,
                color: hex_color("#3f1600"),
                texture: new Texture("assets/exit.jpg", "LINEAR_MIPMAP_LINEAR")
            }),

            /* UNUSED material:
            dungeonwall: new Material(new defs.Fake_Bump_Map(1), {
               ambient: 1, diffusivity: 0.5, specularity: 0.5,
               color: hex_color("#3f1600"),
               texture: new Texture("assets/dungeon_wall.jpg", "LINEAR_MIPMAP_LINEAR")
            }),
            floor: new Material(new defs.Fake_Bump_Map(1), {
                color: hex_color("#150000"),
                ambient: 1, diffusivity: 0.3,
                texture: new Texture("assets/gravelfloor.jpg", "LINEAR_MIPMAP_LINEAR")
            }),
           */

        }
        this.isTimeOut = false;
        this.interval = null

    }

    updateValue() {
        this.isTimeOut = true;
    }

    countdown(minutes, seconds) {
        //this.isTimeOut = false;
        var time = minutes * 60 + seconds;
        this.interval = setInterval(() => {
            var el = document.getElementById('timer');
            if (time == 0) {
                setTimeout(() => {
                    el.innerHTML = '';
                    this.updateValue();
                }, 10);
                clearInterval(this.interval);
            }
            var minutes = Math.floor(time / 60);
            if (minutes < 10) minutes = "0" + minutes;
            var seconds = time % 60;
            if (seconds < 10) seconds = "0" + seconds;
            var text = minutes + ':' + seconds;
            if (!this.title_screen){
                el.innerHTML = text;
            }
            time--;
        }, 1000);
    }

    stopMusic() {
        var audio = document.getElementById("backgroundMusic");
        audio.pause();
        audio.currentTime = 0;

        var el = document.getElementById('timer');
        clearInterval(this.interval);
        el.innerHTML = '';
    }

    playMusic() {
        var audio = document.getElementById("backgroundMusic");
        audio.play();
    }

    moveplay() {
        var audio = document.getElementById("moveAudio");
        audio.play();
    }

    collectplay() {
        var audio = document.getElementById("collectAudio");
        audio.play();
    }

    collectkeys() {
        var audio = document.getElementById("collectKeys");
        audio.play();
    }


    make_control_panel() {

        this.key_triggered_button("Start Game", ["Enter"], () => {


            if (this.title_screen) {
                this.title_screen = false;
                this.countdown(3, 0);
                this.playMusic();
                this.cheese_count = 0;
            }
            if (this.z_movement <= 3 || this.isTimeOut) {
                this.title_screen = true;
            }
        });
        this.key_triggered_button("Go up,", ["ArrowUp"], () => {
            this.moveplay();
            this.udSpeed = 15;
            this.did_ud_move = true;
        }, undefined, () => {
            this.udSpeed = 0;
        });
        this.key_triggered_button("Go down,", ["ArrowDown"], () => {
            this.moveplay();
            this.udSpeed = -15;
            this.did_ud_move = true;
        }, undefined, () => {
            this.udSpeed = 0;
        });
        this.key_triggered_button("Go Left,", ["ArrowLeft"], () => {
            this.moveplay();
            //this.angle = 2*Math.PI / 180;
            this.rotation_magnitude = 60;
            //this.player_angle_of_view += 10*(2*Math.PI / 180);
        }, undefined, () => {
            this.rotation_magnitude = 0;
        });
        this.key_triggered_button("Go Right,", ["ArrowRight"], () => {
            this.moveplay();
            //this.angle = -(2*Math.PI / 180);
            this.rotation_magnitude = -60;
            //this.player_angle_of_view -= 10*(2*Math.PI / 180);
        }, undefined, () => {
            this.rotation_magnitude = 0;
        });
    }

    rotate_view(dt) {
        this.player_angle_of_view += this.rotation_magnitude * dt * (2 * Math.PI / 180);
    }

    handleMovement(dt) {
        let dx = this.udSpeed * Math.sin(this.player_angle_of_view);
        let dz = this.udSpeed * Math.cos(this.player_angle_of_view);
        if (this.collision_with_topwall && this.collision_with_leftwall) {
            dx = Math.max(this.udSpeed * Math.sin(this.player_angle_of_view), 0);
            dz = Math.min(this.udSpeed * Math.cos(this.player_angle_of_view), 0);
        }
        else if (this.collision_with_topwall && this.collision_with_rightwall) {
            dx = Math.max(this.udSpeed * Math.sin(this.player_angle_of_view), 0);
            dz = Math.max(this.udSpeed * Math.cos(this.player_angle_of_view), 0);
        }
        else if (this.collision_with_bottomwall && this.collision_with_leftwall) {
            dx = Math.min(this.udSpeed * Math.sin(this.player_angle_of_view), 0);
            dz = Math.min(this.udSpeed * Math.cos(this.player_angle_of_view), 0);
        }
        else if (this.collision_with_bottomwall && this.collision_with_rightwall) {
            dx = Math.min(this.udSpeed * Math.sin(this.player_angle_of_view), 0);
            dz = Math.max(this.udSpeed * Math.cos(this.player_angle_of_view), 0);
        }
        else if (this.collision_with_topwall) {
            dx = Math.max(this.udSpeed * Math.sin(this.player_angle_of_view), 0);
        }
        else if (this.collision_with_leftwall) {
            dz = Math.min(this.udSpeed * Math.cos(this.player_angle_of_view), 0);
        }
        else if (this.collision_with_rightwall) {
            dz = Math.max(this.udSpeed * Math.cos(this.player_angle_of_view), 0);
        }
        else if (this.collision_with_bottomwall) {
            dx = Math.min(this.udSpeed * Math.sin(this.player_angle_of_view), 0);
        }

        this.collision_with_topwall = false;
        this.collision_with_bottomwall = false;
        this.collision_with_leftwall = false;
        this.collision_with_rightwall = false;
        this.x_movement += dx * dt;
        this.z_movement += dz * dt;

    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            //program_state.set_camera(this.initial_camera_location);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        //Basic setup variables
        const t = this.t = program_state.animation_time / 1000;
        const dt = program_state.animation_delta_time / 1000;
        let model_transform = Mat4.identity();

        //lighting
        let light_position = vec4(0, 100, 0, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 10000), new Light(vec4(this.x_movement, 1.5, this.z_movement, 1), color(1, 1, 1, 1), 10000)];


        // display the title screen before start of the game
        if (this.title_screen) {
            // initialize variables
            this.x_movement = 0;
            this.z_movement = 10;
            this.cheese_count = 0;
            this.player_angle_of_view = 0;
            this.silverKey = false;
            this.goldenKey = false;
            this.isTimeOut = false;
            // initialize cheese map
            for (let i = 0; i < this.mapwidth; i++) {
                this.cheese_position[i] = [];
                for (let j = 0; j < this.mapwidth; j++) {
                    this.cheese_position[i][j] = Math.random();
                }
            }
            let camera = Mat4.look_at(vec3(0, 0, 0), vec3(0, 1, 0), vec3(0, 0, 1));
            program_state.set_camera(camera);

            let text_transform = Mat4.identity().times(Mat4.translation(-.40, 1, .26)).times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(0.05, 0.05, 0.05));
            this.shapes.text_line.set_string("Hungry Mouse", context.context);
            this.shapes.text_line.draw(context, program_state, text_transform, this.materials.text_image);

            text_transform = Mat4.identity().times(Mat4.translation(-.28, 1, .16)).times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(0.02, 0.02, 0.02));
            this.shapes.text_line.set_string("Press \"enter\" to play", context.context);
            this.shapes.text_line.draw(context, program_state, text_transform, this.materials.text_image);

            text_transform = Mat4.identity().times(Mat4.translation(-.075, 1, 0)).times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(0.01, 0.01, 0.01));
            this.shapes.text_line.set_string("Controls:", context.context);
            this.shapes.text_line.draw(context, program_state, text_transform, this.materials.text_image);

            text_transform = Mat4.identity().times(Mat4.translation(-.275, 1, -.05)).times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(0.01, 0.01, 0.01));
            this.shapes.text_line.set_string("Left/Right Arrows = rotate player", context.context);
            this.shapes.text_line.draw(context, program_state, text_transform, this.materials.text_image);

            text_transform = Mat4.identity().times(Mat4.translation(-.275, 1, -.1)).times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(0.01, 0.01, 0.01));
            this.shapes.text_line.set_string("Up/Down Arrows = move forwards/backwards", context.context);
            this.shapes.text_line.draw(context, program_state, text_transform, this.materials.text_image);

            text_transform = Mat4.identity().times(Mat4.translation(-.6, 1, -.25)).times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(0.01, 0.01, 0.01));
            this.shapes.text_line.set_string("Get at least 25 pieces of cheese, the silver key and golden key to open the exit gate.", context.context);
            this.shapes.text_line.draw(context, program_state, text_transform, this.materials.text_image);

            text_transform = Mat4.identity().times(Mat4.translation(-.6, 1, -.28)).times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(0.01, 0.01, 0.01));
            this.shapes.text_line.set_string("Exit the maze to win the game.", context.context);
            this.shapes.text_line.draw(context, program_state, text_transform, this.materials.text_image);

            // initialize the variables

            return;
        }

        // this is when the player steps on the exit tile of the maze
        else if (this.z_movement <= 3 || this.isTimeOut) {
            let camera = Mat4.look_at(vec3(0, 0, 0), vec3(0, 1, 0), vec3(0, 0, 1));
            program_state.set_camera(camera);

            let text_transform = Mat4.identity().times(Mat4.translation(-.35, 1, .26)).times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(0.05, 0.05, 0.05));
            this.shapes.text_line.set_string(this.isTimeOut ? 'You Lost!' : " You Win!", context.context);
            this.shapes.text_line.draw(context, program_state, text_transform, this.materials.text_image);

            text_transform = Mat4.identity().times(Mat4.translation(-.38, 1, .16)).times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(0.02, 0.02, 0.02));
            this.shapes.text_line.set_string("Press \"enter\" to continue", context.context);
            this.shapes.text_line.draw(context, program_state, text_transform, this.materials.text_image);

            text_transform = Mat4.identity().times(Mat4.translation(-.15, 1, -.25)).times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(0.01, 0.01, 0.01));
            this.shapes.text_line.set_string("Cheese Count:" + this.cheese_count + "/25", context.context);
            this.shapes.text_line.draw(context, program_state, text_transform, this.materials.text_image);
            this.stopMusic();
            return;
        }

        // draw the blue sky, which is a patterned sphere
        let sky_transformation = Mat4.identity()
            .times(Mat4.translation(0, -50, 0))
            .times(Mat4.scale(400, 400, 400));
        this.shapes.sphere.draw(context, program_state, sky_transformation, this.materials.sky);

        // draw the actual maze
        this.draw_maze(context, program_state, model_transform);

        // Handle Player Movement
        this.rotate_view(dt);
        this.handleMovement(dt);

        // set camera
        let camera = Mat4.look_at(vec3(this.x_movement, 1.5, this.z_movement), vec3(this.x_movement + (5 * Math.sin(this.player_angle_of_view)), 1.5, this.z_movement + (5 * Math.cos(this.player_angle_of_view))), vec3(0, 1, 0));
        program_state.set_camera(camera);

        // draw screen display
        this.draw_screen(context, program_state);


        if (this.attached != undefined) {
            // Blend desired camera position with existing camera matrix (from previous frame) to smoothly pull camera towards planet
            program_state.camera_inverse = this.attached().map((x, i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1));
        }

    }

    check_collision(model_transform, x_width, z_width, object) {

        // collides with left wall
        if (this.x_movement >= model_transform[0][3] - x_width && this.x_movement <= model_transform[0][3] + x_width
            && this.z_movement >= model_transform[2][3] - z_width - this.leeway
            && this.z_movement <= model_transform[2][3] - z_width + this.leeway) {
            this.collision_with_leftwall = true;
            console.log("leftwall");
        }
        // collides with right wall
        if (this.x_movement >= model_transform[0][3] - x_width && this.x_movement <= model_transform[0][3] + x_width
            && this.z_movement >= model_transform[2][3] + z_width - this.leeway
            && this.z_movement <= model_transform[2][3] + z_width + this.leeway) {
            this.collision_with_rightwall = true;
            console.log("rightwall");
        }
        // collides with top wall
        if (this.z_movement >= model_transform[2][3] - z_width && this.z_movement <= model_transform[2][3] + z_width
            && this.x_movement >= model_transform[0][3] + x_width - this.leeway
            && this.x_movement <= model_transform[0][3] + x_width + this.leeway) {
            this.collision_with_topwall = true;
            console.log("topwall");
        }
        // collides with bottom wall
        if (this.z_movement >= model_transform[2][3] - z_width && this.z_movement <= model_transform[2][3] + z_width
            && this.x_movement >= model_transform[0][3] - x_width - this.leeway
            && this.x_movement <= model_transform[0][3] - x_width + this.leeway) {
            this.collision_with_bottomwall = true;
            console.log("bottomwall");
        }

        // check if it collides with cheese or key
        if (object) {
            if (this.x_movement + 1 >= model_transform[0][3] - x_width && this.x_movement - 1 <= model_transform[0][3] + x_width
                && this.z_movement + 1 >= model_transform[2][3] - z_width && this.z_movement - 1 <= model_transform[2][3] + z_width) {
                return true;
            }
        }


    }

    draw_maze(context, program_state, model_transform) {
        // general transformation matrix of walls
        let wall_transform = Mat4.identity().times(Mat4.translation(-10, 3, 0));

        // iterate through the map to complete the whole map
        for (let i = 0; i < this.mapwidth; i++) {
            for (let j = 0; j < this.mapwidth; j++) {

                // draw floor
                let floor_ij_transform = wall_transform.times(Mat4.translation(i * 10, -10, j * 10)).times(Mat4.scale(5, 5, 5));
                this.shapes.wall.draw(context, program_state, floor_ij_transform, this.materials.floor);

                // draw the bottom layer of the ceiling
                //let ij_transform = wall_transform.times(Mat4.translation(i * 10, 10, j * 10)).times(Mat4.scale(5, 5, 5));
                //if (i<8){
                //this.shapes.wall.draw(context, program_state, ij_transform, this.materials.wall);
                //}

                // draw the walls
                if (this.map[i][j] == 1) {

                    let ij_transform = wall_transform.times(Mat4.translation(i * 10, 0, j * 10)).times(Mat4.scale(5, 5, 5));
                    if (i == 1 && j == 0) {
                        // draw first door that is on the player's back at the start of the game
                        this.shapes.door.draw(context, program_state, ij_transform, this.materials.door);
                        this.check_collision(ij_transform, 5, 5);
                    }
                    else if (i == 13 && j == 0) { // this is final door location
                        // draw final door
                        if (!(this.goldenKey && this.silverKey && this.cheese_count >= 25)) {
                            this.shapes.door.draw(context, program_state, ij_transform, this.materials.door);
                        }
                        else{
                            this.shapes.door.draw(context, program_state, ij_transform.times(Mat4.scale(0.5,0.5,0.5)), this.materials.exit);
                        }
                    }
                    else {
                        this.shapes.wall.draw(context, program_state, ij_transform, this.materials.wall);
                        this.check_collision(ij_transform, 5, 5, false);
                    }

                }

                // draw the corridor
                else {
                    let ij_transform = wall_transform.times(Mat4.translation(i * 10, 20, j * 10)).times(Mat4.scale(5, 5, 5));
                    if (i < 8) { // top layer of the ceiling, to make the arena look like a citadel
                        //this.shapes.wall.draw(context, program_state, ij_transform, i<8? this.materials.wall:this.materials.dungeonwall);
                    }
                }
                // draw silver key
                if (i == 10 && j == 3 && !this.silverKey) {
                    let silverkey_transform = wall_transform.times(Mat4.translation(i * 10, -1.7, j * 10))
                        .times(Mat4.rotation(Math.PI * this.t, 0, 1, 0))
                        .times(Mat4.rotation(-Math.PI * 2 / 3, 0, 0, 1))
                        .times(Mat4.scale(2, 2, 2));
                    this.shapes.key.draw(context, program_state, silverkey_transform, this.materials.silverkey);
                    let contact_silver_Key = this.check_collision(silverkey_transform, 5, 5, true);
                    if (contact_silver_Key) {
                        this.collectkeys();
                        this.silverKey = true;
                        console.log("found silverkey ");
                    }
                }
                // draw golden key
                else if (i == 11 && j == 9 && !this.goldenKey) {
                    let goldenkey_transform = wall_transform.times(Mat4.translation(i * 10, -1.7, j * 10))
                        .times(Mat4.rotation(Math.PI * this.t, 0, 1, 0))
                        .times(Mat4.rotation(-Math.PI * 2 / 3, 0, 0, 1))
                        .times(Mat4.scale(2, 2, 2));
                    this.shapes.key.draw(context, program_state, goldenkey_transform, this.materials.goldenkey);
                    let contact_golden_Key = this.check_collision(goldenkey_transform, 5, 5, true);
                    if (contact_golden_Key) {
                        this.collectkeys();
                        this.goldenKey = true;
                        console.log("found goldenkey ");
                    }
                }
                // draw cheese with 0.4 probability of occuring in each tile in the corridor
                else if (this.cheese_position[i][j] >= 0.6 && !(j < 2)) {
                    let cheese_width = 3;
                    let ij_transform = wall_transform.times(Mat4.translation(i * 10, -1.7, j * 10))
                        .times(Mat4.rotation(Math.PI * this.t, 0, 1, 0))
                        .times(Mat4.rotation(Math.PI * this.cheese_position[i][j] / 2.0, 0, 0, 1))
                        .times(Mat4.scale(0.9, 1.2, 1.2));
                    this.shapes.cheese.draw(context, program_state, ij_transform, this.materials.cheese);
                    // handles player bumping into the cheese
                    let contactCheese = this.check_collision(ij_transform, cheese_width, cheese_width, true);
                    if (contactCheese) {
                        this.collectplay();
                        this.cheese_position[i][j] = 0;
                        this.cheese_count++; // cheese collected
                    }
                }

            }
        }
    }

    draw_screen(context, program_state) {
        // transform to screen matrix
        let screen_transform = Mat4.identity().times(Mat4.translation(this.x_movement + 0.2 * Math.sin(this.player_angle_of_view), 1.5, this.z_movement + 0.2 * Math.cos(this.player_angle_of_view)))
            .times(Mat4.rotation(this.player_angle_of_view, 0, 1, 0));

        // draw top-left cheese symbol
        let cheese_symbol_location = screen_transform
            //.times(Mat4.translation(0.25, 0.112, 0))
            .times(Mat4.translation(0.125, 0.065, 0))
            .times(Mat4.rotation(-Math.PI / 6, 1, 0, -1))
            .times(Mat4.scale(0.006, 0.01, 0.01));
        this.shapes.cheese.draw(context, program_state, cheese_symbol_location, this.materials.cheese);

        // draw cheese count
        let text_transform = screen_transform
            .times(Mat4.translation(0.107, 0.067, 0))
            .times(Mat4.rotation(Math.PI, 0, 1, 0))
            .times(Mat4.scale(0.005, 0.005, 0.005));
        this.shapes.text_line.set_string(this.cheese_count + "/25", context.context);
        this.shapes.text_line.draw(context, program_state, text_transform, this.materials.text_image);

        // draw cheese count
        let comment_transform = screen_transform
        if (!(this.goldenKey && this.silverKey && this.cheese_count >= 25)){
            comment_transform = comment_transform
                .times(Mat4.translation(0.02, -0.075, 0))
                .times(Mat4.rotation(Math.PI, 0, 1, 0))
                .times(Mat4.scale(0.002, 0.002, 0.002));
            this.shapes.text_line.set_string("Get 25 pieces of cheese, the Silver Key and Golden Key.", context.context);
        }
        else{
            comment_transform = comment_transform
                .times(Mat4.translation(-0.06, -0.075, 0))
                .times(Mat4.rotation(Math.PI, 0, 1, 0))
                .times(Mat4.scale(0.002, 0.002, 0.002));
            this.shapes.text_line.set_string("Exit the maze to escape", context.context);
        }


        this.shapes.text_line.draw(context, program_state, comment_transform, this.materials.text_image);

        // draw silver key
        let silverkey_transform = screen_transform
            .times(Mat4.translation(0.1, -0.065, 0))
            .times(Mat4.rotation(-Math.PI * 2 / 3, 0, 0, 1))
            .times(Mat4.scale(0.0045, 0.0045, 0.0045));
        this.shapes.key.draw(context, program_state, silverkey_transform.times(Mat4.scale(2, 2, 2)), this.silverKey ? this.materials.silverkey : this.materials.silverkey.override({ color: color(.6156, .6156, .6156, .35) }));

        // draw golden key
        let goldenkey_transform = screen_transform
            .times(Mat4.translation(0.125, -0.065, 0))
            .times(Mat4.rotation(-Math.PI * 2 / 3, 0, 0, 1))
            .times(Mat4.scale(0.0045, 0.0045, 0.0045));
        this.shapes.key.draw(context, program_state, goldenkey_transform.times(Mat4.scale(2, 2, 2)), this.goldenKey ? this.materials.goldenkey : this.materials.goldenkey.override({ color: color(.8275, .5608, 0, .35) }));

        // draw top-right mini map
        let map_location = screen_transform
            .times(Mat4.translation(-0.1, 0.039, 0))
            .times(Mat4.scale(0.001, 0.001, 0.001));
        // draw player location
        let point_location = map_location
            .times(Mat4.translation(-this.z_movement / 3.4, (this.x_movement / 3.4) + 3, 0)).times(Mat4.scale(1.5, 1.5, 1.5));
        this.shapes.sphere.draw(context, program_state, point_location, this.materials.sky);

        // draw the actual mini-map
        for (let i = 0; i < this.mapwidth; i++) {
            for (let j = 0; j < this.mapwidth; j++) {
                let ij_transform = map_location.times(Mat4.translation(-j * 3, i * 3, 0)).times(Mat4.scale(1.5, 1.5, 1.5));
                if (this.map[i][j] == 1) {
                    if (i == 13 && j == 0) {
                        this.shapes.box.draw(context, program_state, ij_transform.times(Mat4.scale(1, 1, .01)),
                            (this.goldenKey && this.silverKey && this.cheese_count >= 25) ? this.materials.map_floor :
                                this.materials.door);
                    }
                    this.shapes.square.draw(context, program_state, ij_transform, this.materials.map_wall);
                }
                else {
                    this.shapes.square.draw(context, program_state, ij_transform, this.materials.map_floor);
                }
                // draw silver key location
                if (i == 10 && j == 3 && !this.silverKey) {
                    this.shapes.key.draw(context, program_state, ij_transform.times(Mat4.rotation(-Math.PI * 2 / 3, 0, 0, 1)).times(Mat4.scale(1.5, 1.5, 1.5)), this.materials.silverkey);
                }
                // draw golden key location
                else if (i == 11 && j == 9 && !this.goldenKey) {
                    this.shapes.key.draw(context, program_state, ij_transform.times(Mat4.rotation(-Math.PI * 2 / 3, 0, 0, 1)).times(Mat4.scale(1.5, 1.5, 1.5)), this.materials.goldenkey);
                }
            }
        }




    }

}