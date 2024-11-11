module NotesApp::NotesManager {

    use std::signer;
    use aptos_framework::timestamp;
    use aptos_framework::vector;

    struct Note has key, store, drop, copy { // Added 'copy' ability
        created_on: u64, 
        edit: bool,
    }

    struct NotesCollection has key, store, copy { // Added 'copy' ability
        notes: vector<Note>,
    }


    public entry fun initialize_collection(account: &signer) {
        if (!exists<NotesCollection>(signer::address_of(account))) {
            let collection = NotesCollection {
                notes: vector::empty<Note>(),
            };
            move_to(account, collection);
        }
    }

    public entry fun add_note(account: &signer) acquires NotesCollection { // Added acquires annotation
        let collection = borrow_global_mut<NotesCollection>(signer::address_of(account));
        let new_note = Note {
            created_on: timestamp::now_seconds(),
            edit: true,
        };
        vector::push_back(&mut collection.notes, new_note);
    }

    public entry fun delete_note(account: &signer, index: u64) acquires NotesCollection { // Added acquires annotation
        let collection = borrow_global_mut<NotesCollection>(signer::address_of(account));
        vector::remove<Note>(&mut collection.notes, index);
    }

    public entry fun toggle_edit(account: &signer, index: u64) acquires NotesCollection { // Added acquires annotation
        let collection: &mut NotesCollection = borrow_global_mut<NotesCollection>(signer::address_of(account));
        let note_ref = vector::borrow_mut<Note>(&mut collection.notes, index);
        note_ref.edit = !note_ref.edit;
    }

    public fun get_notes(account: &signer): vector<Note> acquires NotesCollection {
        let collection = borrow_global<NotesCollection>(signer::address_of(account));
        collection.notes
    }
}
