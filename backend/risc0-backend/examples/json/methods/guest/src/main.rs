use json_core::Outputs;
use risc0_zkvm::{
    guest::env,
    sha::{Impl, Sha256, Digest},
};

fn hash_json_key(key: &str) -> Digest {
    *Impl::hash_bytes(key.as_bytes())
}

fn compute_merkle_root(hashes: &[Digest]) -> Digest {
    if hashes.is_empty() {
        return Digest::default();
    }
    if hashes.len() == 1 {
        return hashes[0];
    }
    let mut next_level = Vec::new();
    for chunk in hashes.chunks(2) {
        if chunk.len() == 2 {
            let combined = [chunk[0].as_bytes(), chunk[1].as_bytes()].concat();
            next_level.push(*Impl::hash_bytes(&combined));
        } else {
            next_level.push(chunk[0]);
        }
    }
    compute_merkle_root(&next_level)
}

fn main() {
    let data: String = env::read();
    let json_data = json::parse(&data).unwrap();

    let mut field_names = Vec::new();
    let mut field_hashes = Vec::new();

    if let json::JsonValue::Object(obj) = json_data {
        for (key, _) in obj.iter() {
            field_names.push(key.to_string());
            let field_hash = hash_json_key(key);
            field_hashes.push(field_hash);
        }
    } else {
        panic!("Expected JSON object");
    }

    let merkle_root = compute_merkle_root(&field_hashes);

    let out = Outputs {
        data: field_names,
        hash: merkle_root,
    };
    env::commit(&out);
}
